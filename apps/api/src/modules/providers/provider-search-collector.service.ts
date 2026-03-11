import { Injectable } from '@nestjs/common'
import {
  ProviderType,
  SEARCH_LIMITS,
  clampSearchLimit,
  normalizeSearchInput,
  type NppesRawProvider,
  type SearchInputShape,
  type SearchProvidersDto,
} from '@npi/contracts'
import { NppesClientService } from '../nppes-client/nppes-client.service'

interface SearchCollectorOptions {
  upstreamLimit?: number
}

export interface SearchCollectorResult {
  rawProviders: NppesRawProvider[]
  upstreamLimitUsed: number
  partitioned: boolean
  partitionCount: number
  complete: boolean
  overflowedPartitionCount: number
  estimatedRemainingProviders: number
}

interface InternalSearchQuery extends SearchInputShape {
  providerType?: SearchProvidersDto['providerType']
}

@Injectable()
export class ProviderSearchCollectorService {
  constructor(private readonly nppesClientService: NppesClientService) {}

  async collect(
    searchInput: SearchInputShape,
    options: SearchCollectorOptions = {},
  ): Promise<SearchCollectorResult> {
    const upstreamLimitUsed = clampSearchLimit(options.upstreamLimit ?? searchInput.limit)
    const normalizedSearch = normalizeSearchInput({
      ...searchInput,
      page: SEARCH_LIMITS.defaultPage,
      limit: upstreamLimitUsed,
    })
    const rootQueries = this.buildRootQueries(normalizedSearch)
    const aggregateProviders: NppesRawProvider[] = []
    let partitioned = rootQueries.length > 1
    let partitionCount = 0
    let complete = true
    let overflowedPartitionCount = 0
    let estimatedRemainingProviders = 0

    for (const rootQuery of rootQueries) {
      const result = await this.collectQuery(rootQuery, upstreamLimitUsed, false)

      aggregateProviders.push(...result.rawProviders)
      partitioned ||= result.partitioned
      partitionCount += result.partitionCount
      complete &&= result.complete
      overflowedPartitionCount += result.overflowedPartitionCount
      estimatedRemainingProviders += result.estimatedRemainingProviders
    }

    return {
      rawProviders: dedupeProvidersByNpi(aggregateProviders),
      upstreamLimitUsed,
      partitioned,
      partitionCount,
      complete,
      overflowedPartitionCount,
      estimatedRemainingProviders,
    }
  }

  private async collectQuery(
    query: InternalSearchQuery,
    upstreamLimitUsed: number,
    fromPartition: boolean,
  ): Promise<SearchCollectorResult> {
    const probeResponse = await this.nppesClientService.searchProviders({
      ...query,
      page: SEARCH_LIMITS.defaultPage,
      limit: upstreamLimitUsed,
    })
    const resultCount = probeResponse.result_count ?? probeResponse.results?.length ?? 0

    if (resultCount <= SEARCH_LIMITS.maxRetrievableResults) {
      return {
        rawProviders: await this.collectPagedProviders(query, upstreamLimitUsed, probeResponse),
        upstreamLimitUsed,
        partitioned: fromPartition,
        partitionCount: 1,
        complete: true,
        overflowedPartitionCount: 0,
        estimatedRemainingProviders: 0,
      }
    }

    const childQueries = this.buildPostalChildQueries(query)

    if (childQueries.length === 0) {
      const rawProviders = await this.collectPagedProviders(query, upstreamLimitUsed, probeResponse)

      return {
        rawProviders,
        upstreamLimitUsed,
        partitioned: fromPartition,
        partitionCount: 1,
        complete: false,
        overflowedPartitionCount: 1,
        estimatedRemainingProviders: Math.max(0, resultCount - rawProviders.length),
      }
    }

    const aggregateProviders: NppesRawProvider[] = []
    let partitionCount = 0
    let complete = true
    let overflowedPartitionCount = 0
    let estimatedRemainingProviders = 0

    for (const childQuery of childQueries) {
      const result = await this.collectQuery(childQuery, upstreamLimitUsed, true)

      aggregateProviders.push(...result.rawProviders)
      partitionCount += result.partitionCount
      complete &&= result.complete
      overflowedPartitionCount += result.overflowedPartitionCount
      estimatedRemainingProviders += result.estimatedRemainingProviders
    }

    return {
      rawProviders: aggregateProviders,
      upstreamLimitUsed,
      partitioned: true,
      partitionCount,
      complete,
      overflowedPartitionCount,
      estimatedRemainingProviders,
    }
  }

  private async collectPagedProviders(
    query: InternalSearchQuery,
    upstreamLimitUsed: number,
    initialResponse: { result_count?: number; results?: NppesRawProvider[] },
  ): Promise<NppesRawProvider[]> {
    const rawProviders = [...(initialResponse.results ?? [])]
    const resultCount = initialResponse.result_count ?? rawProviders.length
    let page = 2

    while (rawProviders.length < resultCount) {
      const nextSkip = (page - 1) * upstreamLimitUsed

      if (nextSkip > SEARCH_LIMITS.maxSkip) {
        break
      }

      const response = await this.nppesClientService.searchProviders({
        ...query,
        page,
        limit: upstreamLimitUsed,
      })
      const responseProviders = response.results ?? []

      rawProviders.push(...responseProviders)

      if (responseProviders.length < upstreamLimitUsed) {
        break
      }

      page += 1
    }

    return rawProviders
  }

  private buildRootQueries(searchInput: InternalSearchQuery): InternalSearchQuery[] {
    const baseQueries = searchInput.providerType || searchInput.npi
      ? [searchInput]
      : [
          {
            ...searchInput,
            providerType: ProviderType.Individual,
          },
          {
            ...searchInput,
            providerType: ProviderType.Organization,
          },
        ]

    return baseQueries.flatMap((query) =>
      shouldSeedPostalPartitions(query) ? buildInitialPostalPartitions(query) : [query],
    )
  }

  private buildPostalChildQueries(query: InternalSearchQuery): InternalSearchQuery[] {
    if (!query.state) {
      return []
    }

    if (!query.zipCode) {
      return buildInitialPostalPartitions(query)
    }

    const postalPrefix = getPostalPrefix(query.zipCode)

    if (!postalPrefix || postalPrefix.length >= 5) {
      return []
    }

    return Array.from({ length: 10 }, (_, index) => `${postalPrefix}${index}`).map((prefix) => ({
      ...query,
      zipCode: prefix.length === 5 ? prefix : `${prefix}*`,
    }))
  }
}

function buildInitialPostalPartitions(query: InternalSearchQuery): InternalSearchQuery[] {
  return Array.from({ length: 100 }, (_, index) => index.toString().padStart(2, '0')).map(
    (prefix) => ({
      ...query,
      zipCode: `${prefix}*`,
    }),
  )
}

function shouldSeedPostalPartitions(query: InternalSearchQuery): boolean {
  return Boolean(
    query.state &&
    !query.city &&
    !query.zipCode &&
    !query.taxonomyCode &&
    !query.taxonomyDescription,
  )
}

function getPostalPrefix(zipCode: string): string | undefined {
  if (/^[0-9]{5}$/.test(zipCode)) {
    return zipCode
  }

  const match = /^([0-9]{2,4})\*$/.exec(zipCode)

  return match?.[1]
}

function dedupeProvidersByNpi(rawProviders: NppesRawProvider[]): NppesRawProvider[] {
  const dedupedProviders = new Map<string, NppesRawProvider>()
  let missingNumberIndex = 0

  for (const rawProvider of rawProviders) {
    const key = rawProvider.number ?? `missing-number-${missingNumberIndex++}`

    if (!dedupedProviders.has(key)) {
      dedupedProviders.set(key, rawProvider)
    }
  }

  return Array.from(dedupedProviders.values())
}
