import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import type { SearchProvidersDto, NppesRawResponse } from '@npi/contracts'
import { buildNppesSearchParams } from '@npi/contracts'
import axiosRetry, { exponentialDelay, isNetworkError } from 'axios-retry'
import type { AxiosError } from 'axios'
import { firstValueFrom } from 'rxjs'
import {
  NppesUnavailableException,
  UpstreamRateLimitedException,
} from '../../common/errors/nppes.exceptions'

@Injectable()
export class NppesClientService {
  constructor(private readonly httpService: HttpService) {
    axiosRetry(this.httpService.axiosRef, {
      retries: 3,
      retryDelay: exponentialDelay,
      retryCondition: (error) => {
        const status = error.response?.status

        return status === 429 || status === 502 || status === 503 || isNetworkError(error)
      },
    })
  }

  async searchProviders(searchDto: SearchProvidersDto): Promise<NppesRawResponse> {
    const params = buildNppesSearchParams(searchDto)

    try {
      const response = await firstValueFrom(this.httpService.get<NppesRawResponse>('/', { params }))

      return response.data
    } catch (error) {
      throw this.mapError(error)
    }
  }

  private mapError(error: unknown): HttpException {
    const axiosError = error as AxiosError<{ Errors?: string[] }>
    const status = axiosError.response?.status

    if (status === 429) {
      return new UpstreamRateLimitedException()
    }

    return new NppesUnavailableException(
      axiosError.message || 'Failed to load providers from the NPPES API.',
    )
  }
}
