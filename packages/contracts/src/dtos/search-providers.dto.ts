import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator'
import { ProviderType, SEARCH_LIMITS } from '../constants/provider.constants'
import { IsValidSearchCriteria } from '../validators/search-criteria.validator'

export class SearchProvidersDto {
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'zipCode must be a 5-digit string' })
  zipCode?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'state must be a 2-letter uppercase code' })
  state?: string

  @IsOptional()
  @Matches(/^[A-Z0-9]{10}$/, { message: 'taxonomyCode must be a 10-character alphanumeric code' })
  taxonomyCode?: string

  @IsOptional()
  @IsString()
  taxonomyDescription?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn([ProviderType.Individual, ProviderType.Organization], {
    message: 'providerType must be 1 (Individual) or 2 (Organization)',
  })
  providerType?: ProviderType

  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.defaultPage)
  page: number = SEARCH_LIMITS.defaultPage

  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.minLimit)
  @Max(SEARCH_LIMITS.maxLimit)
  limit: number = SEARCH_LIMITS.defaultLimit

  @IsValidSearchCriteria()
  readonly searchCriteria?: undefined
}
