import { BadRequestException, HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common'
import { ApiErrorCode } from '@npi/contracts'
import { NppesUnavailableException, UpstreamRateLimitedException } from '../errors/nppes.exceptions'
import { ApiExceptionFilter } from './api-exception.filter'

describe('ApiExceptionFilter', () => {
  let filter: ApiExceptionFilter
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    filter = new ApiExceptionFilter()
    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })
  })

  function createHost(): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusMock,
        }),
      }),
    } as ArgumentsHost
  }

  it('normalizes validation errors', () => {
    filter.catch(new BadRequestException(['zipCode must be a 5-digit string']), createHost())

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.ValidationError,
        message: 'Validation failed',
        details: ['zipCode must be a 5-digit string'],
      }),
    )
  })

  it('preserves custom upstream exception payloads', () => {
    filter.catch(new NppesUnavailableException('unavailable'), createHost())

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.NppesUnavailable,
        message: 'unavailable',
      }),
    )
  })

  it('maps generic string http exceptions by status', () => {
    filter.catch(new HttpException('missing', HttpStatus.NOT_FOUND), createHost())

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.ProviderNotFound,
        message: 'missing',
      }),
    )
  })

  it('keeps rate limited responses as RATE_LIMITED', () => {
    filter.catch(new UpstreamRateLimitedException(), createHost())

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.RateLimited,
      }),
    )
  })
})
