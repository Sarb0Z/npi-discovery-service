import { Test } from '@nestjs/testing'
import { createIndividualProvider, createOrganizationProvider } from '../../../test/fixtures/provider.fixture'
import { createZipSearchDto } from '../../../test/fixtures/search-params.fixture'
import { ProvidersService } from '../providers/providers.service'
import { StatisticsService } from './statistics.service'

describe('StatisticsService', () => {
  let service: StatisticsService
  let providersService: { search: jest.Mock }

  beforeEach(async () => {
    providersService = {
      search: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: ProvidersService,
          useValue: providersService,
        },
      ],
    }).compile()

    service = module.get(StatisticsService)
  })

  it('builds summary counts and distributions', async () => {
    providersService.search.mockResolvedValue({
      providers: [
        createIndividualProvider(),
        createIndividualProvider({ npi: '2222222222', address: { ...createIndividualProvider().address, city: 'Austin' } }),
        createOrganizationProvider(),
      ],
      metadata: {
        totalCount: 3,
        searchParams: {},
        timestamp: new Date().toISOString(),
        duration: 1,
        page: 1,
        limit: 50,
      },
    })

    const result = await service.getStatistics(createZipSearchDto())

    expect(result.summary).toEqual({
      totalProviders: 3,
      individualCount: 2,
      organizationCount: 1,
      multipleTaxonomiesCount: 2,
      uniqueCitiesCount: 2,
    })
    expect(result.providerTypeDistribution).toEqual([
      { name: 'Individual', value: 2 },
      { name: 'Organization', value: 1 },
    ])
  })

  it('returns top specialties and cities sorted by count', async () => {
    providersService.search.mockResolvedValue({
      providers: [
        createIndividualProvider(),
        createIndividualProvider({ npi: '2222222222' }),
        createOrganizationProvider({ address: { ...createOrganizationProvider().address, city: 'Austin' } }),
      ],
      metadata: {
        totalCount: 3,
        searchParams: {},
        timestamp: new Date().toISOString(),
        duration: 1,
        page: 1,
        limit: 50,
      },
    })

    const result = await service.getStatistics(createZipSearchDto())

    expect(result.topSpecialties[0]).toEqual({
      description: 'General Practice Dentistry',
      count: 2,
      percentage: 66.67,
    })
    expect(result.topCities[0]).toEqual({
      name: 'Austin',
      count: 3,
    })
  })
})
