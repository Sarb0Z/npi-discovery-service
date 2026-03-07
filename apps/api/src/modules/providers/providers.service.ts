import { Injectable } from '@nestjs/common'
import {
  SEARCH_LIMITS,
  normalizeSearchInput,
  type SearchProvidersDto,
  type SearchResponseDto,
} from '@npi/contracts'
import { mapNppesProviders, matchesPrimaryTaxonomy } from './providers.mapper'
import { ProviderSearchCollectorService } from './provider-search-collector.service'

interface SearchExecutionOptions {
  upstreamLimit?: number
}

@Injectable()
export class ProvidersService {
  constructor(private readonly providerSearchCollectorService: ProviderSearchCollectorService) {}

  async search(
    searchDto: SearchProvidersDto,
    options: SearchExecutionOptions = {},
  ): Promise<SearchResponseDto> {
    const startedAt = Date.now()
    const normalizedSearch = normalizeSearchInput(searchDto)
    const collectionResult = await this.providerSearchCollectorService.collect(normalizedSearch, {
      upstreamLimit: options.upstreamLimit,
    })
    const rawProviders = collectionResult.rawProviders
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
        upstreamLimitUsed: collectionResult.upstreamLimitUsed,
        partitioned: collectionResult.partitioned,
        partitionCount: collectionResult.partitionCount,
        complete: collectionResult.complete,
        overflowedPartitionCount: collectionResult.overflowedPartitionCount,
        estimatedRemainingProviders: collectionResult.estimatedRemainingProviders,
      },
    }
  }
}
