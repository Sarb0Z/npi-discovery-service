import 'reflect-metadata'

import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { of, throwError } from 'rxjs'
import {
  createNppesResponse,
  createRawIndividualProvider,
} from '../../../test/fixtures/nppes-response.fixture'
import { createZipSearchDto } from '../../../test/fixtures/search-params.fixture'
import {
  NppesUnavailableException,
  UpstreamRateLimitedException,
} from '../../common/errors/nppes.exceptions'
import { NppesClientService } from './nppes-client.service'

jest.mock('axios-retry', () => {
  const mockAxiosRetry = jest.fn()

  return {
    __esModule: true,
    default: Object.assign(mockAxiosRetry, {
      exponentialDelay: jest.fn(),
      isNetworkError: jest.fn().mockReturnValue(false),
    }),
  }
})

describe('NppesClientService', () => {
  let service: NppesClientService
  let httpService: { get: jest.Mock; axiosRef: Record<string, unknown> }

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
      axiosRef: {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      },
    }

    const module = await Test.createTestingModule({
      providers: [
        NppesClientService,
        {
          provide: HttpService,
          useValue: httpService,
        },
      ],
    }).compile()

    service = module.get(NppesClientService)
  })

  it('builds correct query params for ZIP searches', async () => {
    httpService.get.mockReturnValue(
      of({ data: createNppesResponse([createRawIndividualProvider()]) }),
    )

    await service.searchProviders(createZipSearchDto({ limit: 25 }))

    const [, requestConfig] = httpService.get.mock.calls[0] as [
      string,
      { params: Record<string, string | number | undefined> },
    ]

    expect(requestConfig.params).toMatchObject({
      postal_code: '75201',
      version: '2.1',
      limit: 25,
      skip: 0,
    })
  })

  it('builds correct query params for city and state searches', async () => {
    httpService.get.mockReturnValue(
      of({ data: createNppesResponse([createRawIndividualProvider()]) }),
    )

    await service.searchProviders({ city: 'Austin', state: 'TX', page: 2, limit: 50 })

    const [, requestConfig] = httpService.get.mock.calls[0] as [
      string,
      { params: Record<string, string | number | undefined> },
    ]

    expect(requestConfig.params).toMatchObject({
      city: 'Austin',
      state: 'TX',
      skip: 50,
    })
  })

  it('maps upstream 429 responses to UpstreamRateLimitedException', async () => {
    const error = {
      response: { status: 429 },
      message: 'rate limited',
    }

    httpService.get.mockReturnValue(throwError(() => error))

    await expect(service.searchProviders(createZipSearchDto())).rejects.toBeInstanceOf(
      UpstreamRateLimitedException,
    )
  })

  it('maps other upstream failures to NppesUnavailableException', async () => {
    const error = {
      response: { status: 503 },
      message: 'service unavailable',
    }

    httpService.get.mockReturnValue(throwError(() => error))

    await expect(service.searchProviders(createZipSearchDto())).rejects.toBeInstanceOf(
      NppesUnavailableException,
    )
  })

  it('returns the raw response data on success', async () => {
    const response = createNppesResponse([createRawIndividualProvider()], 1)
    httpService.get.mockReturnValue(of({ data: response }))

    await expect(service.searchProviders(createZipSearchDto())).resolves.toEqual(response)
  })
})
