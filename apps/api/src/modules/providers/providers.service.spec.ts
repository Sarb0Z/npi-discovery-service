import { Test } from '@nestjs/testing'
import {
  createRawIndividualProvider,
  createRawOrganizationProvider,
} from '../../../test/fixtures/nppes-response.fixture'
import {
  createCityStateSearchDto,
  createStateOnlySearchDto,
  createZipSearchDto,
} from '../../../test/fixtures/search-params.fixture'
import { UpstreamRateLimitedException } from '../../common/errors/nppes.exceptions'
import { ProviderSearchCollectorService } from './provider-search-collector.service'
import { ProvidersService } from './providers.service'

describe('ProvidersService', () => {
  let service: ProvidersService
  let providerSearchCollectorService: { collect: jest.Mock }

  beforeEach(async () => {
    providerSearchCollectorService = {
      collect: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: ProviderSearchCollectorService,
          useValue: providerSearchCollectorService,
        },
      ],
    }).compile()

    service = module.get(ProvidersService)
  })

  it('filters by primary taxonomy description', async () => {
    providerSearchCollectorService.collect.mockResolvedValue(
      createCollectionResult([createRawIndividualProvider(), createRawOrganizationProvider()]),
    )

    const result = await service.search(
      createCityStateSearchDto({ taxonomyDescription: 'dentistry' }),
    )

    expect(result.providers).toHaveLength(1)
    expect(result.providers[0]?.primarySpecialty).toBe('General Practice Dentistry')
  })

  it('allows pure state-only searches through the partition collector', async () => {
    providerSearchCollectorService.collect.mockResolvedValue(
      createCollectionResult([createRawIndividualProvider()]),
    )

    const result = await service.search(createStateOnlySearchDto())

    expect(result.providers).toHaveLength(1)
    expect(providerSearchCollectorService.collect).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'TX', page: 1, limit: 50 }),
      expect.objectContaining({}),
    )
  })

  it('returns response metadata with partition collection details', async () => {
    providerSearchCollectorService.collect.mockResolvedValue(
      createCollectionResult([createRawIndividualProvider()], {
        partitioned: true,
        partitionCount: 8,
        complete: false,
        overflowedPartitionCount: 1,
        estimatedRemainingProviders: 25,
        upstreamLimitUsed: 200,
      }),
    )

    const result = await service.search(createZipSearchDto({ limit: 25 }))

    expect(result.metadata).toEqual(
      expect.objectContaining({
        totalCount: 1,
        page: 1,
        limit: 25,
        upstreamLimitUsed: 200,
        partitioned: true,
        partitionCount: 8,
        complete: false,
        overflowedPartitionCount: 1,
        estimatedRemainingProviders: 25,
      }),
    )
    expect(result.metadata.searchParams.zipCode).toBe('75201')
    expect(result.metadata.timestamp).toEqual(expect.any(String))
    expect(result.metadata.duration).toEqual(expect.any(Number))
  })

  it('propagates upstream rate limiting errors', async () => {
    providerSearchCollectorService.collect.mockRejectedValue(new UpstreamRateLimitedException())

    await expect(service.search(createZipSearchDto())).rejects.toBeInstanceOf(
      UpstreamRateLimitedException,
    )
  })
})

function createCollectionResult(
  rawProviders: ReturnType<typeof createRawIndividualProvider>[],
  overrides: Partial<{
    upstreamLimitUsed: number
    partitioned: boolean
    partitionCount: number
    complete: boolean
    overflowedPartitionCount: number
    estimatedRemainingProviders: number
  }> = {},
) {
  return {
    rawProviders,
    upstreamLimitUsed: 50,
    partitioned: false,
    partitionCount: 1,
    complete: true,
    overflowedPartitionCount: 0,
    estimatedRemainingProviders: 0,
    ...overrides,
  }
}
