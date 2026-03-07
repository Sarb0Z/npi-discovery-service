import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { SEARCH_LIMITS } from '../constants/provider.constants'
import { SearchProvidersDto } from './search-providers.dto'

export class BulkCollectionDto extends SearchProvidersDto {
  @ApiPropertyOptional({
    description: 'Batch size for bulk collection requests sent to the NPPES API.',
    example: SEARCH_LIMITS.maxBatchSize,
    minimum: SEARCH_LIMITS.minBatchSize,
    maximum: SEARCH_LIMITS.maxBatchSize,
    default: SEARCH_LIMITS.maxBatchSize,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.minBatchSize)
  @Max(SEARCH_LIMITS.maxBatchSize)
  batchSize: number = SEARCH_LIMITS.maxBatchSize
}
