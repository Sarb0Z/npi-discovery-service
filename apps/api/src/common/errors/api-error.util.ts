import { HttpStatus } from '@nestjs/common'
import { ApiErrorCode } from '@npi/contracts'

export function getErrorCodeForStatus(status: number): ApiErrorCode {
  if (status === HttpStatus.BAD_REQUEST) {
    return ApiErrorCode.ValidationError
  }

  if (status === HttpStatus.NOT_FOUND) {
    return ApiErrorCode.ProviderNotFound
  }

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    return ApiErrorCode.RateLimited
  }

  return ApiErrorCode.NppesUnavailable
}