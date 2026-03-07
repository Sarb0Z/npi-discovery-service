import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { SEARCH_LIMITS } from '../constants/provider.constants'
import { SearchProvidersDto } from './search-providers.dto'

export class BulkCollectionDto extends SearchProvidersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.minBatchSize)
  @Max(SEARCH_LIMITS.maxBatchSize)
  batchSize: number = SEARCH_LIMITS.maxBatchSize
}
