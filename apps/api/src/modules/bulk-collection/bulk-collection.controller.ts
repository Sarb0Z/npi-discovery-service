import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { BulkCollectionDto, type BulkJobResponseDto } from '@npi/contracts'
import { BulkCollectionService } from './bulk-collection.service'

@Controller('providers')
export class BulkCollectionController {
  constructor(private readonly bulkCollectionService: BulkCollectionService) {}

  @Post('bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  async startCollection(@Body() bulkCollectionDto: BulkCollectionDto): Promise<BulkJobResponseDto> {
    return this.bulkCollectionService.startCollection(bulkCollectionDto)
  }
}
