import { Injectable } from '@nestjs/common'
import {
  SEARCH_LIMITS,
  normalizeSearchInput,
  type SearchProvidersDto,
  type SearchResponseDto,
} from '@npi/contracts'
import { RedisService } from '../../common/redis/redis.service'
import { mapNppesProviders, matchesPrimaryTaxonomy } from './providers.mapper'
import { ProviderSearchCollectorService } from './provider-search-collector.service'

interface SearchExecutionOptions {
  upstreamLimit?: number
}

const BROAD_SEARCH_CACHE_TTL_SECONDS = 60 * 10

@Injectable()
export class ProvidersService {
  constructor(
    private readonly providerSearchCollectorService: ProviderSearchCollectorService,
    private readonly redisService: RedisService,
  ) {}

  async search(
    searchDto: SearchProvidersDto,
    options: SearchExecutionOptions = {},
  ): Promise<SearchResponseDto> {
    const startedAt = Date.now()
    const normalizedSearch = normalizeSearchInput(searchDto)
    const cacheKey = buildSearchCacheKey(normalizedSearch, options)

    if (shouldCacheSearch(normalizedSearch)) {
      const cachedResponse = await this.redisService.getJson<SearchResponseDto>(cacheKey)

      if (cachedResponse) {
        return {
          ...cachedResponse,
          metadata: {
            ...cachedResponse.metadata,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startedAt,
          },
        }
      }
    }

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

    const response: SearchResponseDto = {
      providers,
      metadata: {
        totalCount: providers.length,
        searchParams: {
          npi: normalizedSearch.npi,
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

    if (shouldCacheSearch(normalizedSearch) && response.metadata.complete) {
      await this.redisService.setJson(cacheKey, response, BROAD_SEARCH_CACHE_TTL_SECONDS)
    }

    return response
  }
}

function shouldCacheSearch(searchDto: SearchProvidersDto): boolean {
  return Boolean(searchDto.state && !searchDto.zipCode)
}

function buildSearchCacheKey(
  searchDto: SearchProvidersDto,
  options: SearchExecutionOptions,
): string {
  return `providers:search:${JSON.stringify({
    npi: searchDto.npi,
    zipCode: searchDto.zipCode,
    city: searchDto.city,
    state: searchDto.state,
    taxonomyCode: searchDto.taxonomyCode,
    taxonomyDescription: searchDto.taxonomyDescription,
    providerType: searchDto.providerType,
    page: searchDto.page ?? 1,
    limit: searchDto.limit ?? SEARCH_LIMITS.defaultLimit,
    upstreamLimit: options.upstreamLimit,
  })}`
}
