import { Test } from '@nestjs/testing'
import { createIndividualProvider } from '../../../test/fixtures/provider.fixture'
import { createZipSearchDto } from '../../../test/fixtures/search-params.fixture'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'

describe('ProvidersController', () => {
  let controller: ProvidersController
  let providersService: { search: jest.Mock }

  beforeEach(async () => {
    providersService = {
      search: jest.fn(),
    }

    const module = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: providersService,
        },
      ],
    }).compile()

    controller = module.get(ProvidersController)
  })

  it('returns providers for a valid search request', async () => {
    providersService.search.mockResolvedValue({
      providers: [createIndividualProvider()],
      metadata: {
        totalCount: 1,
        searchParams: { zipCode: '75201' },
        timestamp: new Date().toISOString(),
        duration: 10,
        page: 1,
        limit: 50,
      },
    })

    await expect(controller.search(createZipSearchDto())).resolves.toEqual(
      expect.objectContaining({ providers: [expect.objectContaining({ npi: '1234567893' })] }),
    )
  })

  it('delegates to ProvidersService with the incoming dto', async () => {
    providersService.search.mockResolvedValue({
      providers: [],
      metadata: {
        totalCount: 0,
        searchParams: {},
        timestamp: new Date().toISOString(),
        duration: 0,
        page: 1,
        limit: 50,
      },
    })

    await controller.search(createZipSearchDto())

    expect(providersService.search).toHaveBeenCalledWith(
      expect.objectContaining({ zipCode: '75201' }),
    )
  })
})
