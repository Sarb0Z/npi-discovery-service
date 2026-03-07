import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BulkCollectionDto, type BulkJobResponseDto } from '@npi/contracts'
import { BulkCollectionService } from './bulk-collection.service'

@Controller('providers')
@ApiTags('providers')
export class BulkCollectionController {
  constructor(private readonly bulkCollectionService: BulkCollectionService) {}

  @Post('bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Start an asynchronous bulk provider collection job' })
  @ApiBody({ type: BulkCollectionDto })
  @ApiAcceptedResponse({ description: 'Returns the queued bulk collection job identifier.' })
  async startCollection(@Body() bulkCollectionDto: BulkCollectionDto): Promise<BulkJobResponseDto> {
    return this.bulkCollectionService.startCollection(bulkCollectionDto)
  }
}
