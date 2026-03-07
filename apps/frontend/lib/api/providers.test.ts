import { ApiErrorCode, ProviderType } from '@npi/contracts'
import {
  fetchStatistics,
  FrontendApiError,
  getProviderTypeLabel,
  searchProviders,
  startBulkCollection,
} from '@/lib/api/providers'

describe('providers api client', () => {
  const mockFetch = jest.spyOn(global, 'fetch')

  afterEach(() => {
    mockFetch.mockReset()
  })

  it('normalizes optional search fields before calling the search endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ providers: [], metadata: { totalCount: 0 } }),
    } as never)

    await searchProviders({
      zipCode: '75201',
      city: '',
      state: '',
      taxonomyDescription: 'Dentist',
      providerType: 1,
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/providers/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zipCode: '75201',
        taxonomyDescription: 'Dentist',
        providerType: 1,
      }),
    })
  })

  it('throws a typed frontend error when the API returns an error payload', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        code: ApiErrorCode.ValidationError,
        message: 'Bad request',
        details: ['State is required'],
        timestamp: '2026-03-07T00:00:00.000Z',
      }),
    } as never)

    await expect(
      fetchStatistics({
        zipCode: '',
        city: 'Austin',
        state: 'TX',
        taxonomyDescription: '',
        providerType: undefined,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'FrontendApiError',
        message: 'Bad request',
      }),
    )
  })

  it('falls back to a generic error when the error body cannot be parsed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('invalid json')),
    } as never)

    await expect(
      startBulkCollection({
        zipCode: '',
        city: '',
        state: 'TX',
        taxonomyDescription: '',
        providerType: undefined,
        batchSize: 200,
      }),
    ).rejects.toEqual(expect.any(FrontendApiError))

    await expect(
      startBulkCollection({
        zipCode: '',
        city: '',
        state: 'TX',
        taxonomyDescription: '',
        providerType: undefined,
        batchSize: 200,
      }),
    ).rejects.toMatchObject({
      message: 'An unexpected error occurred while contacting the API.',
    })
  })

  it('returns readable provider type labels', () => {
    expect(getProviderTypeLabel()).toBe('All providers')
    expect(getProviderTypeLabel(ProviderType.Individual)).toBe('Individual')
    expect(getProviderTypeLabel(ProviderType.Organization)).toBe('Organization')
    expect(getProviderTypeLabel(99 as ProviderType)).toBe('All providers')
  })
})
