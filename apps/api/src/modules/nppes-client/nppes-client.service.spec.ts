import 'reflect-metadata'

import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { ProviderType } from '@npi/contracts'
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
import axiosRetry from 'axios-retry'

jest.mock('axios-retry', () => {
  const mockAxiosRetry = jest.fn()
  const mockExponentialDelay = jest.fn()
  const mockIsNetworkError = jest.fn().mockReturnValue(false)

  return {
    __esModule: true,
    exponentialDelay: mockExponentialDelay,
    isNetworkError: mockIsNetworkError,
    default: Object.assign(mockAxiosRetry, {
      exponentialDelay: mockExponentialDelay,
      isNetworkError: mockIsNetworkError,
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

  it('registers axios-retry against the shared axios instance', () => {
    expect(axiosRetry).toHaveBeenCalledWith(
      httpService.axiosRef,
      expect.objectContaining({
        retries: 3,
        retryDelay: expect.any(Function),
        retryCondition: expect.any(Function),
      }),
    )
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

  it('maps providerType to the upstream enumeration_type parameter', async () => {
    httpService.get.mockReturnValue(
      of({ data: createNppesResponse([createRawIndividualProvider()]) }),
    )

    await service.searchProviders(createZipSearchDto({ providerType: ProviderType.Individual }))

    const [, requestConfig] = httpService.get.mock.calls[0] as [
      string,
      { params: Record<string, string | number | undefined> },
    ]

    expect(requestConfig.params.enumeration_type).toBe('NPI-1')
  })

  it('clamps upstream limit and skip bounds when building params', async () => {
    httpService.get.mockReturnValue(
      of({ data: createNppesResponse([createRawIndividualProvider()]) }),
    )

    await service.searchProviders(createZipSearchDto({ page: 999, limit: 500 }))

    const [, requestConfig] = httpService.get.mock.calls[0] as [
      string,
      { params: Record<string, string | number | undefined> },
    ]

    expect(requestConfig.params).toMatchObject({
      limit: 200,
      skip: 1000,
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

  it('maps network failures to NppesUnavailableException', async () => {
    const error = {
      message: 'connect ECONNREFUSED 127.0.0.1:443',
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
