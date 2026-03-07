import { ApiErrorCode } from '@npi/contracts'

export function getErrorCodeForStatus(status: number): ApiErrorCode {
  if (status === 400) {
    return ApiErrorCode.ValidationError
  }

  if (status === 404) {
    return ApiErrorCode.ProviderNotFound
  }

  if (status === 429) {
    return ApiErrorCode.RateLimited
  }

  return ApiErrorCode.NppesUnavailable
}