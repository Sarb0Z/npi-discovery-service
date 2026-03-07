import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ProviderType, SEARCH_LIMITS } from '../constants/provider.constants'
import { IsValidSearchCriteria } from '../validators/search-criteria.validator'

export class SearchProvidersDto {
  @ApiPropertyOptional({
    description: '5-digit ZIP code used to search providers by postal code.',
    example: '75201',
  })
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'zipCode must be a 5-digit string' })
  zipCode?: string

  @ApiPropertyOptional({
    description: 'City name paired with state for city/state provider search.',
    example: 'Austin',
  })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({
    description: 'Two-letter uppercase US state code.',
    example: 'TX',
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'state must be a 2-letter uppercase code' })
  state?: string

  @ApiPropertyOptional({
    description: '10-character taxonomy code used to narrow provider specialty.',
    example: '1223G0001X',
  })
  @IsOptional()
  @Matches(/^[A-Z0-9]{10}$/, { message: 'taxonomyCode must be a 10-character alphanumeric code' })
  taxonomyCode?: string

  @ApiPropertyOptional({
    description: 'Free-text taxonomy description used to filter by primary specialty.',
    example: 'Dentist',
  })
  @IsOptional()
  @IsString()
  taxonomyDescription?: string

  @ApiPropertyOptional({
    description: 'Provider type filter where 1 is Individual and 2 is Organization.',
    enum: ProviderType,
    example: ProviderType.Individual,
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([ProviderType.Individual, ProviderType.Organization], {
    message: 'providerType must be 1 (Individual) or 2 (Organization)',
  })
  providerType?: ProviderType

  @ApiPropertyOptional({
    description: '1-based page number converted to the NPPES skip parameter.',
    example: SEARCH_LIMITS.defaultPage,
    default: SEARCH_LIMITS.defaultPage,
  })
  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.defaultPage)
  page: number = SEARCH_LIMITS.defaultPage

  @ApiPropertyOptional({
    description: 'Page size used for upstream NPPES requests.',
    example: SEARCH_LIMITS.defaultLimit,
    minimum: SEARCH_LIMITS.minLimit,
    maximum: SEARCH_LIMITS.maxLimit,
    default: SEARCH_LIMITS.defaultLimit,
  })
  @Type(() => Number)
  @IsInt()
  @Min(SEARCH_LIMITS.minLimit)
  @Max(SEARCH_LIMITS.maxLimit)
  limit: number = SEARCH_LIMITS.defaultLimit

  @IsValidSearchCriteria()
  readonly searchCriteria?: undefined
}
