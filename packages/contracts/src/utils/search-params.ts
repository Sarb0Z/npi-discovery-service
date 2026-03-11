import {
  EXPORT_FILE_EXTENSION,
  EXPORT_FILE_PREFIX,
  NPPES_API_VERSION,
  SEARCH_LIMITS,
} from '../constants/provider.constants'
import type { NppesSearchParams } from '../interfaces/nppes-response.interface'
import type { SearchProvidersDto } from '../dtos/search-providers.dto'
import { toNppesEnumerationType } from './provider-type'

export interface SearchInputShape {
  npi?: string
  zipCode?: string
  city?: string
  state?: string
  taxonomyCode?: string
  taxonomyDescription?: string
  providerType?: SearchProvidersDto['providerType']
  page?: number
  limit?: number
}

export function clampSearchLimit(limit?: number): number {
  const candidate = limit ?? SEARCH_LIMITS.defaultLimit

  if (candidate < SEARCH_LIMITS.minLimit) {
    return SEARCH_LIMITS.minLimit
  }

  if (candidate > SEARCH_LIMITS.maxLimit) {
    return SEARCH_LIMITS.maxLimit
  }

  return candidate
}

export function clampBatchSize(batchSize?: number): number {
  const candidate = batchSize ?? SEARCH_LIMITS.maxBatchSize

  if (candidate < SEARCH_LIMITS.minBatchSize) {
    return SEARCH_LIMITS.minBatchSize
  }

  if (candidate > SEARCH_LIMITS.maxBatchSize) {
    return SEARCH_LIMITS.maxBatchSize
  }

  return candidate
}

export function clampSkip(skip?: number): number {
  const candidate = skip ?? 0

  if (candidate < 0) {
    return 0
  }

  if (candidate > SEARCH_LIMITS.maxSkip) {
    return SEARCH_LIMITS.maxSkip
  }

  return candidate
}

export function normalizeSearchInput<T extends SearchInputShape>(input: T): T {
  return {
    ...input,
    zipCode: normalizeString(input.zipCode),
    city: normalizeString(input.city),
    state: normalizeUppercaseCode(input.state),
    taxonomyCode: normalizeUppercaseCode(input.taxonomyCode),
    taxonomyDescription: normalizeString(input.taxonomyDescription),
    page: input.page ?? SEARCH_LIMITS.defaultPage,
    limit: clampSearchLimit(input.limit),
  }
}

export function calculateSkip(page?: number, limit?: number): number {
  const normalizedPage = page && page > 0 ? page : SEARCH_LIMITS.defaultPage
  const normalizedLimit = clampSearchLimit(limit)
  const skip = (normalizedPage - 1) * normalizedLimit

  return clampSkip(skip)
}

export function buildNppesSearchParams(input: SearchInputShape): NppesSearchParams {
  const normalizedInput = normalizeSearchInput(input)

  return {
    version: NPPES_API_VERSION,
    number: normalizedInput.npi,
    postal_code: normalizedInput.zipCode,
    city: normalizedInput.city,
    state: normalizedInput.state,
    taxonomy_code: normalizedInput.taxonomyCode,
    taxonomy_description: normalizedInput.taxonomyDescription,
    enumeration_type: toNppesEnumerationType(normalizedInput.providerType),
    limit: clampSearchLimit(normalizedInput.limit),
    skip: calculateSkip(normalizedInput.page, normalizedInput.limit),
  }
}

export function buildLocationLabel(input: SearchInputShape): string {
  const normalizedInput = normalizeSearchInput(input)

  if (normalizedInput.zipCode) {
    return normalizedInput.zipCode
  }

  if (normalizedInput.npi) {
    return `npi_${normalizedInput.npi}`
  }

  if (normalizedInput.city && normalizedInput.state) {
    return `${normalizedInput.city}_${normalizedInput.state}`
  }

  if (normalizedInput.state) {
    return normalizedInput.state
  }

  return 'unknown-location'
}

export function sanitizeFileNameSegment(value?: string): string {
  const normalizedValue = normalizeString(value)?.toLowerCase() ?? 'all'

  return normalizedValue.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'all'
}

export function buildProviderExportFileName(
  input: SearchInputShape,
  timestamp: Date = new Date(),
): string {
  const location = sanitizeFileNameSegment(buildLocationLabel(input))
  const taxonomy = sanitizeFileNameSegment(input.taxonomyDescription ?? input.taxonomyCode)
  const isoStamp = timestamp.toISOString().replace(/[:.]/g, '-')

  return `${EXPORT_FILE_PREFIX}_${location}_${taxonomy}_${isoStamp}${EXPORT_FILE_EXTENSION}`
}

function normalizeString(value?: string): string | undefined {
  const normalizedValue = value?.trim()

  return normalizedValue === '' ? undefined : normalizedValue
}

function normalizeUppercaseCode(value?: string): string | undefined {
  const normalizedValue = normalizeString(value)

  return normalizedValue?.toUpperCase()
}
