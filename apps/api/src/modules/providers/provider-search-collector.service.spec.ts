import { Test } from '@nestjs/testing'
import { ProviderType } from '@npi/contracts'
import {
  createNppesResponse,
  createRawIndividualProvider,
  createRawOrganizationProvider,
} from '../../../test/fixtures/nppes-response.fixture'
import {
  createStateOnlySearchDto,
  createZipSearchDto,
} from '../../../test/fixtures/search-params.fixture'
import { NppesClientService } from '../nppes-client/nppes-client.service'
import { ProviderSearchCollectorService } from './provider-search-collector.service'

describe('ProviderSearchCollectorService', () => {
  let service: ProviderSearchCollectorService
  let nppesClientService: { searchProviders: jest.Mock }

  beforeEach(async () => {
    nppesClientService = {
      searchProviders: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        ProviderSearchCollectorService,
        {
          provide: NppesClientService,
          useValue: nppesClientService,
        },
      ],
    }).compile()

    service = module.get(ProviderSearchCollectorService)
  })

  it('splits state-only searches by provider type and postal prefix', async () => {
    nppesClientService.searchProviders.mockImplementation(
      ({ providerType, zipCode }: { providerType?: number; zipCode?: string }) => {
        if (providerType === ProviderType.Individual && zipCode?.startsWith('75')) {
          return createNppesResponse([createRawIndividualProvider({ number: '1234567890' })], 1)
        }

        if (providerType === ProviderType.Organization && zipCode?.startsWith('75')) {
          return createNppesResponse([createRawOrganizationProvider()], 1)
        }

        return createNppesResponse([], 0)
      },
    )

    const result = await service.collect(createStateOnlySearchDto({ limit: 200 }))

    expect(result.rawProviders).toHaveLength(2)
    expect(result.rawProviders.map((provider) => provider.number)).toEqual(
      expect.arrayContaining(['1234567890', '1098765432']),
    )
    expect(result.partitioned).toBe(true)
    expect(result.partitionCount).toBeGreaterThan(2)
    expect(nppesClientService.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'TX',
        providerType: ProviderType.Individual,
        zipCode: '75*',
      }),
    )
    expect(nppesClientService.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'TX',
        providerType: ProviderType.Organization,
        zipCode: '75*',
      }),
    )
  })

  it('deduplicates providers returned from different partitions', async () => {
    nppesClientService.searchProviders.mockImplementation(
      ({ zipCode }: { zipCode?: string }) => {
        if (zipCode === '75*' || zipCode === '76*') {
          return createNppesResponse([], 1400)
        }

        if (zipCode?.startsWith('75')) {
          return createNppesResponse([createRawIndividualProvider({ number: '1234567890' })], 1)
        }

        if (zipCode?.startsWith('76')) {
          return createNppesResponse([createRawIndividualProvider({ number: '1234567890' })], 1)
        }

        return createNppesResponse([], 0)
      },
    )

    const result = await service.collect(
      createStateOnlySearchDto({ providerType: ProviderType.Individual, limit: 200 }),
    )

    expect(result.rawProviders).toHaveLength(1)
  })

  it('flags unresolved overflow when an exact ZIP still exceeds the upstream cap', async () => {
    nppesClientService.searchProviders.mockImplementation(({ page }: { page?: number }) =>
      createNppesResponse(
        Array.from({ length: 200 }, (_, index) =>
          createRawIndividualProvider({
            number: `${(page ?? 1) * 1000 + index}`.padStart(10, '0'),
          }),
        ),
        1400,
      ),
    )

    const result = await service.collect(
      createZipSearchDto({ zipCode: '75201', providerType: ProviderType.Individual, limit: 200 }),
    )

    expect(result.rawProviders).toHaveLength(1200)
    expect(result.complete).toBe(false)
    expect(result.overflowedPartitionCount).toBe(1)
    expect(result.estimatedRemainingProviders).toBe(200)
  })
})
