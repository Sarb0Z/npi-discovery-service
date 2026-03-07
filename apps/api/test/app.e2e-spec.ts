import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request, { type Response } from 'supertest'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'
import { AppModule } from './../src/app.module'
import { BulkCollectionService } from '../src/modules/bulk-collection/bulk-collection.service'
import { ProvidersService } from '../src/modules/providers/providers.service'
import { StatisticsService } from '../src/modules/statistics/statistics.service'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let providersService: { search: jest.Mock }
  let statisticsService: { getStatistics: jest.Mock }
  let bulkCollectionService: { startCollection: jest.Mock }

  const getHttpServer = (): Parameters<typeof request>[0] =>
    app.getHttpServer() as Parameters<typeof request>[0]

  beforeEach(async () => {
    providersService = {
      search: jest.fn(),
    }
    statisticsService = {
      getStatistics: jest.fn(),
    }
    bulkCollectionService = {
      startCollection: jest.fn(),
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProvidersService)
      .useValue(providersService)
      .overrideProvider(StatisticsService)
      .useValue(statisticsService)
      .overrideProvider(BulkCollectionService)
      .useValue(bulkCollectionService)
      .compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new ApiExceptionFilter())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )
    await app.init()
  })

  it('/api/health (GET)', () => {
    return request(getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' })
  })

  it('/api/providers/search (POST) returns providers', async () => {
    providersService.search.mockResolvedValue({
      providers: [
        {
          npi: '1234567893',
          type: 1,
          name: 'Jane Doe, MD',
          primarySpecialty: 'General Practice Dentistry',
          specialties: ['General Practice Dentistry'],
          taxonomies: [
            {
              code: '1223G0001X',
              description: 'General Practice Dentistry',
              primary: true,
              state: 'TX',
            },
          ],
          address: {
            address1: '123 Main St',
            address2: null,
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
          },
          phone: '5125551000',
        },
      ],
      metadata: {
        totalCount: 1,
        searchParams: { zipCode: '75201' },
        timestamp: new Date().toISOString(),
        duration: 1,
        page: 1,
        limit: 50,
      },
    })

    await request(getHttpServer())
      .post('/api/providers/search')
      .send({ zipCode: '75201' })
      .expect(200)
      .expect((response: Response) => {
        const body = response.body as {
          providers: unknown[]
          metadata: { totalCount: number }
        }

        expect(body.providers).toHaveLength(1)
        expect(body.metadata.totalCount).toBe(1)
      })
  })

  it('/api/providers/search (POST) validates the zip code', async () => {
    await request(getHttpServer())
      .post('/api/providers/search')
      .send({ zipCode: '75A01' })
      .expect(400)
      .expect((response: Response) => {
        const body = response.body as { code: string; message: string }

        expect(body.code).toBe('VALIDATION_ERROR')
        expect(body.message).toBe('Validation failed')
      })
  })

  it('/api/statistics (POST) returns the statistics payload', async () => {
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
      taxonomyBreakdown: [
        {
          code: '1223G0001X',
          description: 'General Practice Dentistry',
          count: 1,
          percentage: 100,
        },
      ],
    })

    await request(getHttpServer())
      .post('/api/statistics')
      .send({ zipCode: '75201' })
      .expect(200)
      .expect((response: Response) => {
        const body = response.body as { summary: { totalProviders: number } }

        expect(body.summary.totalProviders).toBe(1)
      })
  })

  it('/api/providers/bulk (POST) returns an accepted job response', async () => {
    bulkCollectionService.startCollection.mockResolvedValue({
      jobId: 'job-123',
      status: 'PROCESSING',
      message: 'Bulk collection initiated.',
    })

    await request(getHttpServer())
      .post('/api/providers/bulk')
      .send({ zipCode: '75201', batchSize: 200 })
      .expect(202)
      .expect((response: Response) => {
        const body = response.body as { jobId: string }

        expect(body.jobId).toBe('job-123')
      })
  })
})
