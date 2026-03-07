import type {
  ApiErrorResponse,
  BulkJobResponseDto,
  ProviderType,
  SearchResponseDto,
  StatisticsResponseDto,
} from '@npi/contracts'
import { ApiErrorCode } from '@npi/contracts'
import type { BulkFormValues, SearchFormValues } from '@/lib/schemas/search.schema'

export class FrontendApiError extends Error {
  readonly payload: ApiErrorResponse

  constructor(payload: ApiErrorResponse) {
    super(payload.message)
    this.name = 'FrontendApiError'
    this.payload = payload
  }
}

function normalizeValue(value: string | undefined): string | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined
  }

  return value
}

function normalizeSearchPayload(
  values: SearchFormValues,
): Record<string, number | string | undefined> {
  return {
    zipCode: normalizeValue(values.zipCode),
    city: normalizeValue(values.city),
    state: normalizeValue(values.state),
    taxonomyCode: normalizeValue(values.taxonomyCode),
    taxonomyDescription: normalizeValue(values.taxonomyDescription),
    providerType: values.providerType,
  }
}

async function apiFetch<TResponse>(
  path: string,
  body: Record<string, number | string | undefined>,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const fallback: ApiErrorResponse = {
      code: ApiErrorCode.NppesUnavailable,
      message: 'An unexpected error occurred while contacting the API.',
      timestamp: new Date().toISOString(),
    }

    const payload = (await response.json().catch(() => fallback)) as ApiErrorResponse
    throw new FrontendApiError(payload)
  }

  return (await response.json()) as TResponse
}

export async function searchProviders(values: SearchFormValues): Promise<SearchResponseDto> {
  return apiFetch<SearchResponseDto>('/api/providers/search', normalizeSearchPayload(values))
}

export async function fetchStatistics(values: SearchFormValues): Promise<StatisticsResponseDto> {
  return apiFetch<StatisticsResponseDto>('/api/statistics', normalizeSearchPayload(values))
}

export async function startBulkCollection(values: BulkFormValues): Promise<BulkJobResponseDto> {
  return apiFetch<BulkJobResponseDto>('/api/providers/bulk', {
    ...normalizeSearchPayload(values),
    batchSize: values.batchSize,
  })
}

export function getProviderTypeLabel(providerType?: ProviderType): string {
  if (providerType === undefined) {
    return 'All providers'
  }

  if (Number(providerType) === 1) {
    return 'Individual'
  }

  if (Number(providerType) === 2) {
    return 'Organization'
  }

  return 'All providers'
}
