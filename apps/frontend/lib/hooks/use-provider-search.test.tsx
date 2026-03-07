import {
  ApiErrorCode,
  type BulkJobResponseDto,
  type SearchResponseDto,
  type StatisticsResponseDto,
} from '@npi/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FrontendApiError } from '@/lib/api/providers'
import {
  useBulkCollection,
  useProviderSearch,
  useStatistics,
} from '@/lib/hooks/use-provider-search'
import { useSearchStore } from '@/lib/stores/search-store'

const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()
const mockSearchProviders = jest.fn<Promise<SearchResponseDto>, [unknown]>()
const mockFetchStatistics = jest.fn<Promise<StatisticsResponseDto>, [unknown]>()
const mockStartBulkCollection = jest.fn<Promise<BulkJobResponseDto>, [unknown]>()

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

jest.mock('@/lib/api/providers', () => {
  const actual = jest.requireActual('@/lib/api/providers') as Record<string, unknown>

  return {
    ...actual,
    searchProviders: (values: unknown) => mockSearchProviders(values),
    fetchStatistics: (values: unknown) => mockFetchStatistics(values),
    startBulkCollection: (values: unknown) => mockStartBulkCollection(values),
  }
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('use-provider-search hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stores recent searches and shows a success toast after provider searches', async () => {
    mockSearchProviders.mockResolvedValue({
      providers: [],
      metadata: {
        totalCount: 2,
        searchParams: { zipCode: '75201', taxonomyDescription: 'Dentist' },
        timestamp: '2026-03-07T00:00:00.000Z',
        duration: 100,
        page: 1,
        limit: 50,
        upstreamLimitUsed: 200,
        partitioned: false,
        partitionCount: 1,
        complete: true,
        overflowedPartitionCount: 0,
        estimatedRemainingProviders: 0,
      },
    })

    const { result } = renderHook(() => useProviderSearch(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        zipCode: '75201',
        city: '',
        state: '',
        taxonomyDescription: 'Dentist',
      })
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('Found 2 providers.')
    expect(useSearchStore.getState().recentSearches[0]).toEqual({
      label: 'ZIP 75201',
      query: 'zipCode=75201&taxonomyDescription=Dentist',
    })
  })

  it('shows an error toast when a provider search fails', async () => {
    mockSearchProviders.mockRejectedValue(
      new FrontendApiError({
        code: ApiErrorCode.NppesUnavailable,
        message: 'Registry unavailable',
        timestamp: '2026-03-07T00:00:00.000Z',
      }),
    )

    const { result } = renderHook(() => useProviderSearch(), { wrapper: createWrapper() })

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          zipCode: '75201',
          city: '',
          state: '',
          taxonomyDescription: '',
        }),
      ).rejects.toThrow('Registry unavailable')
    })

    expect(mockToastError).toHaveBeenCalledWith('Registry unavailable')
  })

  it('fetches statistics only when values are present', async () => {
    const statistics: StatisticsResponseDto = {
      summary: {
        totalProviders: 10,
        individualCount: 6,
        organizationCount: 4,
        multipleTaxonomiesCount: 2,
        uniqueCitiesCount: 3,
      },
      providerTypeDistribution: [
        { name: 'Individual', value: 6 },
        { name: 'Organization', value: 4 },
      ],
      topSpecialties: [{ description: 'Dentist', count: 4, percentage: 40 }],
      topCities: [{ name: 'Austin', count: 3 }],
      taxonomyBreakdown: [{ code: '1223G0001X', description: 'Dentist', count: 4, percentage: 40 }],
    }
    mockFetchStatistics.mockResolvedValue(statistics)

    const idle = renderHook(() => useStatistics(null), { wrapper: createWrapper() })
    expect(idle.result.current.fetchStatus).toBe('idle')
    expect(mockFetchStatistics).not.toHaveBeenCalled()

    const { result } = renderHook(
      () =>
        useStatistics({
          zipCode: '',
          city: '',
          state: 'TX',
          taxonomyDescription: '',
          providerType: 1,
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(statistics)
    })

    expect(mockFetchStatistics).toHaveBeenCalledWith({
      zipCode: '',
      city: '',
      state: 'TX',
      taxonomyDescription: '',
      providerType: 1,
    })
  })

  it('starts bulk collection and reports the created job', async () => {
    mockStartBulkCollection.mockResolvedValue({
      jobId: 'job-123',
      status: 'PROCESSING',
      message: 'Bulk collection initiated',
    })

    const { result } = renderHook(() => useBulkCollection(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        zipCode: '',
        city: '',
        state: 'TX',
        taxonomyDescription: '',
        providerType: undefined,
        batchSize: 200,
      })
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('Bulk collection started: job-123')
  })
})
