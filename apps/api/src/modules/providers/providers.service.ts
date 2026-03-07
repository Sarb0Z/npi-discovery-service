import { BadRequestException, Injectable } from '@nestjs/common'
import {
  SEARCH_LIMITS,
  normalizeSearchInput,
  type NppesRawProvider,
  type SearchProvidersDto,
  type SearchResponseDto,
} from '@npi/contracts'
import { NppesClientService } from '../nppes-client/nppes-client.service'
import { mapNppesProviders, matchesPrimaryTaxonomy } from './providers.mapper'

@Injectable()
export class ProvidersService {
  constructor(private readonly nppesClientService: NppesClientService) {}

  async search(searchDto: SearchProvidersDto): Promise<SearchResponseDto> {
    const startedAt = Date.now()
    const normalizedSearch = normalizeSearchInput(searchDto)
    const hasStateOnlySearch =
      normalizedSearch.state &&
      !normalizedSearch.city &&
      !normalizedSearch.zipCode &&
      !normalizedSearch.taxonomyCode &&
      !normalizedSearch.taxonomyDescription

    if (hasStateOnlySearch) {
      throw new BadRequestException(
        'State-only searches should use the bulk collection endpoint or include a taxonomy filter.',
      )
    }

    const rawProviders = await this.collectProviders(normalizedSearch)
    const filteredProviders = rawProviders.filter((rawProvider) =>
      matchesPrimaryTaxonomy(
        rawProvider,
        normalizedSearch.taxonomyDescription,
        normalizedSearch.taxonomyCode,
      ),
    )
    const providers = mapNppesProviders(filteredProviders)

    return {
      providers,
      metadata: {
        totalCount: providers.length,
        searchParams: {
          zipCode: normalizedSearch.zipCode,
          city: normalizedSearch.city,
          state: normalizedSearch.state,
          taxonomyCode: normalizedSearch.taxonomyCode,
          taxonomyDescription: normalizedSearch.taxonomyDescription,
          providerType: normalizedSearch.providerType,
        },
        timestamp: new Date().toISOString(),
        duration: Date.now() - startedAt,
        page: normalizedSearch.page ?? 1,
        limit: normalizedSearch.limit ?? SEARCH_LIMITS.defaultLimit,
      },
    }
  }

  private async collectProviders(searchDto: SearchProvidersDto): Promise<NppesRawProvider[]> {
    const providers: NppesRawProvider[] = []
    const limit = searchDto.limit ?? SEARCH_LIMITS.defaultLimit
    let page = 1
    let totalCount = Number.POSITIVE_INFINITY

    while (providers.length < totalCount) {
      const response = await this.nppesClientService.searchProviders({
        ...searchDto,
        page,
        limit,
      })
      const responseProviders = response.results ?? []

      totalCount = response.result_count ?? responseProviders.length
      providers.push(...responseProviders)

      if (responseProviders.length < limit) {
        break
      }

      const nextSkip = page * limit
      if (nextSkip > SEARCH_LIMITS.maxSkip) {
        break
      }

      page += 1
    }

    return providers
  }
}
