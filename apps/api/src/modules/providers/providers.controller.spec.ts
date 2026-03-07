import { Test } from '@nestjs/testing'
import { BadGatewayException, ValidationPipe } from '@nestjs/common'
import { ProviderType } from '@npi/contracts'
import request from 'supertest'
import { createIndividualProvider } from '../../../test/fixtures/provider.fixture'
import {
  createCityStateSearchDto,
  createZipSearchDto,
} from '../../../test/fixtures/search-params.fixture'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'
import type { INestApplication } from '@nestjs/common'

describe('ProvidersController', () => {
  let controller: ProvidersController
  let providersService: { search: jest.Mock }
  let app: INestApplication

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

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    await app.init()
  })

  afterEach(async () => {
    await app.close()
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

  it('returns providers for a city and state search', async () => {
    providersService.search.mockResolvedValue({
      providers: [createIndividualProvider()],
      metadata: {
        totalCount: 1,
        searchParams: { city: 'Austin', state: 'TX' },
        timestamp: new Date().toISOString(),
        duration: 10,
        page: 1,
        limit: 50,
      },
    })

    await expect(controller.search(createCityStateSearchDto())).resolves.toEqual(
      expect.objectContaining({
        metadata: expect.objectContaining({ totalCount: 1 }),
      }),
    )
  })

  it('forwards providerType filters to the service layer', async () => {
    providersService.search.mockResolvedValue({
      providers: [createIndividualProvider()],
      metadata: {
        totalCount: 1,
        searchParams: { zipCode: '75201', providerType: ProviderType.Individual },
        timestamp: new Date().toISOString(),
        duration: 10,
        page: 1,
        limit: 50,
      },
    })

    await controller.search(createZipSearchDto({ providerType: ProviderType.Individual }))

    expect(providersService.search).toHaveBeenCalledWith(
      expect.objectContaining({ providerType: ProviderType.Individual }),
    )
  })

  it('returns empty arrays unchanged when no providers are found', async () => {
    providersService.search.mockResolvedValue({
      providers: [],
      metadata: {
        totalCount: 0,
        searchParams: { zipCode: '75201' },
        timestamp: new Date().toISOString(),
        duration: 10,
        page: 1,
        limit: 50,
      },
    })

    await expect(controller.search(createZipSearchDto())).resolves.toEqual(
      expect.objectContaining({ providers: [] }),
    )
  })

  it('returns 400 for an invalid ZIP code', async () => {
    await request(app.getHttpServer())
      .post('/providers/search')
      .send({ zipCode: 'ABCDE', page: 1, limit: 50 })
      .expect(400)
  })

  it('returns 400 for an invalid state code', async () => {
    await request(app.getHttpServer())
      .post('/providers/search')
      .send({ city: 'Austin', state: 'Texas', page: 1, limit: 50 })
      .expect(400)
  })

  it('propagates upstream failures as 502 responses', async () => {
    providersService.search.mockRejectedValue(new BadGatewayException('NPPES unavailable'))

    await request(app.getHttpServer())
      .post('/providers/search')
      .send({ zipCode: '75201', page: 1, limit: 50 })
      .expect(502)
  })
})
