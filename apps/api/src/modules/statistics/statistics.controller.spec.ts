import { Test } from '@nestjs/testing'
import { createZipSearchDto } from '../../../test/fixtures/search-params.fixture'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'

describe('StatisticsController', () => {
  let controller: StatisticsController
  let statisticsService: { getStatistics: jest.Mock }

  beforeEach(async () => {
    statisticsService = {
      getStatistics: jest.fn(),
    }

    const module = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: statisticsService,
        },
      ],
    }).compile()

    controller = module.get(StatisticsController)
  })

  it('returns statistics for the requested search', async () => {
    statisticsService.getStatistics.mockResolvedValue({
      summary: {
        totalProviders: 1,
        individualCount: 1,
        organizationCount: 0,
        multipleTaxonomiesCount: 0,
        uniqueCitiesCount: 1,
      },
      providerTypeDistribution: [{ name: 'Individual', value: 1 }],
      topSpecialties: [{ description: 'General Practice Dentistry', count: 1, percentage: 100 }],
      topCities: [{ name: 'Austin', count: 1 }],
    })

    await expect(controller.getStatistics(createZipSearchDto())).resolves.toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({ totalProviders: 1 }),
      }),
    )
  })
})
