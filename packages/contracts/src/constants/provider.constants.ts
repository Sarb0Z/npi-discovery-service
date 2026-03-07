export enum ProviderType {
  Individual = 1,
  Organization = 2,
}

export enum NppesEnumerationType {
  Individual = 'NPI-1',
  Organization = 'NPI-2',
}

export enum ApiErrorCode {
  ValidationError = 'VALIDATION_ERROR',
  ProviderNotFound = 'PROVIDER_NOT_FOUND',
  NppesUnavailable = 'NPPES_UNAVAILABLE',
  RateLimited = 'RATE_LIMITED',
}

export const NPPES_API_VERSION = '2.1'

export const SEARCH_LIMITS = {
  defaultPage: 1,
  defaultLimit: 50,
  minLimit: 1,
  maxLimit: 200,
  minBatchSize: 50,
  maxBatchSize: 200,
  maxSkip: 1000,
} as const

export const EXPORT_FILE_PREFIX = 'providers'

export const EXPORT_FILE_EXTENSION = '.json'

export const FALLBACK_PROVIDER_NAME = 'Unknown Provider'

export const FALLBACK_SPECIALTY = 'Unknown Specialty'
