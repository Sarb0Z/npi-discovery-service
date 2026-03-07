import { HttpStatus } from '@nestjs/common'
import { ApiErrorCode } from '@npi/contracts'
import {
  NppesUnavailableException,
  ProvidersNotFoundException,
  UpstreamRateLimitedException,
} from './nppes.exceptions'

describe('nppes exceptions', () => {
  it('creates a 502 unavailable exception payload', () => {
    const exception = new NppesUnavailableException('down')

    expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
    expect(exception.getResponse()).toEqual({
      code: ApiErrorCode.NppesUnavailable,
      message: 'down',
    })
  })

  it('creates a 429 rate limited exception payload', () => {
    const exception = new UpstreamRateLimitedException('retry later')

    expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
    expect(exception.getResponse()).toEqual({
      code: ApiErrorCode.RateLimited,
      message: 'retry later',
    })
  })

  it('creates a 404 providers not found exception payload', () => {
    const exception = new ProvidersNotFoundException('none found')

    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND)
    expect(exception.getResponse()).toEqual({
      code: ApiErrorCode.ProviderNotFound,
      message: 'none found',
    })
  })
})
