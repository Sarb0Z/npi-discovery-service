import { Injectable, Logger } from '@nestjs/common'
import {
  buildProviderExportFileName,
  type BulkCollectionDto,
  type BulkCollectionMetadata,
  type BulkJobResponseDto,
} from '@npi/contracts'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { ProvidersService } from '../providers/providers.service'

@Injectable()
export class BulkCollectionService {
  private readonly logger = new Logger(BulkCollectionService.name)

  constructor(private readonly providersService: ProvidersService) {}

  startCollection(searchDto: BulkCollectionDto): Promise<BulkJobResponseDto> {
    const jobId = randomUUID()

    void this.collect(jobId, searchDto)

    return Promise.resolve({
      jobId,
      status: 'PROCESSING',
      message:
        'Bulk collection initiated. Results will be saved to the configured output directory.',
    })
  }

  private async collect(jobId: string, searchDto: BulkCollectionDto): Promise<void> {
    const startedAt = Date.now()

    try {
      const searchResponse = await this.providersService.search(searchDto, {
        upstreamLimit: searchDto.batchSize,
      })
      const outputDirectory = process.env.PROVIDERS_OUTPUT_DIR ?? join(process.cwd(), 'output')
      const fileName = buildProviderExportFileName(searchDto)
      const outputPath = join(outputDirectory, fileName)
      const completedAt = Date.now()
      const collectionMetadata: BulkCollectionMetadata = {
        totalProvidersFound:
          searchResponse.providers.length + searchResponse.metadata.estimatedRemainingProviders,
        collectedProviders: searchResponse.providers.length,
        estimatedRemainingProviders: searchResponse.metadata.estimatedRemainingProviders,
        partitioned: searchResponse.metadata.partitioned,
        partitionCount: searchResponse.metadata.partitionCount,
        complete: searchResponse.metadata.complete,
        overflowedPartitionCount: searchResponse.metadata.overflowedPartitionCount,
        upstreamLimitUsed: searchResponse.metadata.upstreamLimitUsed,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date(completedAt).toISOString(),
        durationMs: completedAt - startedAt,
      }

      await mkdir(outputDirectory, { recursive: true })
      await writeFile(
        outputPath,
        JSON.stringify(
          {
            jobId,
            metadata: {
              ...searchResponse.metadata,
              ...collectionMetadata,
            },
            providers: searchResponse.providers,
          },
          null,
          2,
        ),
        'utf8',
      )
    } catch (error) {
      this.logger.error(`Bulk collection job ${jobId} failed`, error)
    }
  }
}
