import { Injectable, Logger } from '@nestjs/common'
import {
  buildProviderExportFileName,
  type BulkCollectionDto,
  type BulkCollectionMetadata,
  type BulkJobProgressDto,
  type BulkJobResponseDto,
} from '@npi/contracts'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { ProvidersService } from '../providers/providers.service'
import { BulkCollectionGateway } from './bulk-collection.gateway'

@Injectable()
export class BulkCollectionService {
  private readonly logger = new Logger(BulkCollectionService.name)

  constructor(
    private readonly providersService: ProvidersService,
    private readonly bulkCollectionGateway: BulkCollectionGateway,
  ) {}

  startCollection(searchDto: BulkCollectionDto): Promise<BulkJobResponseDto> {
    const jobId = randomUUID()

    this.bulkCollectionGateway.publishProgress({
      jobId,
      status: 'PROCESSING',
      message: 'Bulk collection queued. Collecting providers from the registry.',
      totalProvidersFound: 0,
      collectedProviders: 0,
      estimatedRemainingProviders: 0,
    })

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
      const totalProvidersFound =
        searchResponse.providers.length + searchResponse.metadata.estimatedRemainingProviders
      const collectionMetadata: BulkCollectionMetadata = {
        totalProvidersFound,
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

      this.bulkCollectionGateway.publishProgress({
        jobId,
        status: 'PROCESSING',
        message: 'Provider collection complete. Writing export file to disk.',
        totalProvidersFound,
        collectedProviders: searchResponse.providers.length,
        estimatedRemainingProviders: searchResponse.metadata.estimatedRemainingProviders,
        outputFileName: fileName,
      })

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

      this.bulkCollectionGateway.publishProgress({
        jobId,
        status: 'COMPLETED',
        message: 'Bulk collection finished and the export file is ready.',
        totalProvidersFound,
        collectedProviders: searchResponse.providers.length,
        estimatedRemainingProviders: searchResponse.metadata.estimatedRemainingProviders,
        outputFileName: fileName,
        completedAt: collectionMetadata.completedAt,
      })
    } catch (error) {
      this.logger.error(`Bulk collection job ${jobId} failed`, error)
      const message = error instanceof Error ? error.message : 'Unknown bulk collection failure.'
      const failurePayload: BulkJobProgressDto = {
        jobId,
        status: 'FAILED',
        message: 'Bulk collection failed before the export file could be completed.',
        totalProvidersFound: 0,
        collectedProviders: 0,
        estimatedRemainingProviders: 0,
        error: message,
      }

      this.bulkCollectionGateway.publishProgress(failurePayload)
    }
  }
}
