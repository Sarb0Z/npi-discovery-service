import { HttpStatus } from '@nestjs/common'
import { ApiErrorCode } from '@npi/contracts'
import { getErrorCodeForStatus } from './api-error.util'

describe('getErrorCodeForStatus', () => {
  it('maps bad requests to validation errors', () => {
    expect(getErrorCodeForStatus(HttpStatus.BAD_REQUEST)).toBe(ApiErrorCode.ValidationError)
  })

  it('maps not found to provider not found', () => {
    expect(getErrorCodeForStatus(HttpStatus.NOT_FOUND)).toBe(ApiErrorCode.ProviderNotFound)
  })

  it('maps too many requests to rate limited', () => {
    expect(getErrorCodeForStatus(HttpStatus.TOO_MANY_REQUESTS)).toBe(ApiErrorCode.RateLimited)
  })

  it('maps unknown statuses to NPPES unavailable', () => {
    expect(getErrorCodeForStatus(HttpStatus.INTERNAL_SERVER_ERROR)).toBe(
      ApiErrorCode.NppesUnavailable,
    )
  })
})
