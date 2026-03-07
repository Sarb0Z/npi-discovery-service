import { ProviderType, type BulkCollectionDto, type SearchProvidersDto } from '@npi/contracts'

export function createZipSearchDto(
  overrides: Partial<SearchProvidersDto> = {},
): SearchProvidersDto {
  return {
    zipCode: '75201',
    page: 1,
    limit: 50,
    ...overrides,
  }
}

export function createCityStateSearchDto(
  overrides: Partial<SearchProvidersDto> = {},
): SearchProvidersDto {
  return {
    city: 'Austin',
    state: 'TX',
    page: 1,
    limit: 50,
    ...overrides,
  }
}

export function createStateTaxonomySearchDto(
  overrides: Partial<SearchProvidersDto> = {},
): SearchProvidersDto {
  return {
    state: 'TX',
    taxonomyDescription: 'Dentist',
    providerType: ProviderType.Individual,
    page: 1,
    limit: 50,
    ...overrides,
  }
}

export function createStateOnlySearchDto(
  overrides: Partial<SearchProvidersDto> = {},
): SearchProvidersDto {
  return {
    state: 'TX',
    page: 1,
    limit: 50,
    ...overrides,
  }
}

export function createBulkCollectionDto(
  overrides: Partial<BulkCollectionDto> = {},
): BulkCollectionDto {
  return {
    ...createZipSearchDto(),
    batchSize: 200,
    ...overrides,
  }
}
