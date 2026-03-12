import { ApiErrorCode, ProviderType, type SearchResponseDto } from '@npi/contracts'
import { fireEvent, render, screen } from '@testing-library/react'
import { SearchExperience } from '@/components/search/search-experience'
import { FrontendApiError } from '@/lib/api/providers'
import type { useProviderSearch as useProviderSearchHook } from '@/lib/hooks/use-provider-search'
import { useSearchStore } from '@/lib/stores/search-store'

const mockReplace = jest.fn()
const mockUseSearchParams = jest.fn<URLSearchParams, []>()
const mockUseProviderSearch = jest.fn<ReturnType<typeof useProviderSearchHook>, []>()
const mockMutate = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}))

jest.mock('@/lib/hooks/use-provider-search', () => ({
  useProviderSearch: () => mockUseProviderSearch(),
}))

jest.mock('@/components/search/search-form', () => ({
  SearchForm: ({
    onSubmit,
    isSubmitting,
  }: {
    isSubmitting?: boolean
    onSubmit: (values: Record<string, string>) => void
  }) => (
    <button
      disabled={isSubmitting}
      onClick={() => onSubmit({ zipCode: '75201', taxonomyDescription: 'Dentist' })}
      type="button"
    >
      Mock search form
    </button>
  ),
}))

function buildResponse(providers: SearchResponseDto['providers']): SearchResponseDto {
  return {
    providers,
    metadata: {
      totalCount: providers.length,
      searchParams: { zipCode: '75201', taxonomyDescription: 'Dentist' },
      timestamp: '2026-03-07T00:00:00.000Z',
      duration: 120,
      page: 1,
      limit: 50,
      upstreamLimitUsed: 200,
      partitioned: false,
      partitionCount: 1,
      complete: true,
      overflowedPartitionCount: 0,
      estimatedRemainingProviders: 0,
    },
  }
}

function buildProviderSearchResult(
  overrides: Partial<ReturnType<typeof useProviderSearchHook>>,
): ReturnType<typeof useProviderSearchHook> {
  return {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: false,
    isPaused: false,
    isPending: false,
    isSuccess: false,
    mutate: mockMutate,
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    status: 'idle',
    submittedAt: 0,
    variables: undefined,
    ...overrides,
  } as unknown as ReturnType<typeof useProviderSearchHook>
}

describe('SearchExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchParams.mockReturnValue(new URLSearchParams('zipCode=75201'))
  })

  it('loads initial search params and shows the loading skeleton', () => {
    mockUseProviderSearch.mockReturnValue(
      buildProviderSearchResult({ isPending: true, status: 'pending' }),
    )

    render(<SearchExperience />)

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: '75201',
      }),
    )
    expect(screen.getByTestId('search-skeleton')).toBeInTheDocument()
  })

  it('renders upstream errors and retries with the original parameters', () => {
    mockUseProviderSearch.mockReturnValue(
      buildProviderSearchResult({
        error: new FrontendApiError({
          code: ApiErrorCode.RateLimited,
          message: 'Rate limited',
          timestamp: '2026-03-07T00:00:00.000Z',
        }),
        isError: true,
        status: 'error',
      }),
    )

    render(<SearchExperience />)

    expect(
      screen.getByText(
        'The upstream registry is rate limiting requests. Give it a few seconds, then retry.',
      ),
    ).toBeInTheDocument()

    mockMutate.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Retry search' }))

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: '75201',
      }),
    )
  })

  it('renders the empty state and resets the URL', () => {
    mockUseProviderSearch.mockReturnValue(
      buildProviderSearchResult({
        data: buildResponse([]),
        isSuccess: true,
        status: 'success',
      }),
    )

    render(<SearchExperience />)

    fireEvent.click(screen.getByRole('button', { name: 'Reset search' }))

    expect(mockReplace).toHaveBeenCalledWith('/search')
  })

  it('renders successful results and submits new search params', () => {
    useSearchStore.setState({ viewMode: 'card' })
    mockUseProviderSearch.mockReturnValue(
      buildProviderSearchResult({
        data: buildResponse([
          {
            npi: '1234567890',
            type: ProviderType.Individual,
            name: 'Dr. Ada Lovelace',
            primarySpecialty: 'Dentist',
            specialties: ['Dentist', 'Orthodontics'],
            taxonomies: [
              {
                code: '1223G0001X',
                description: 'Dentist',
                primary: true,
                state: 'TX',
              },
              {
                code: '1223X0400X',
                description: 'Orthodontics',
                primary: false,
                state: 'TX',
              },
            ],
            address: {
              address1: '123 Health Ave',
              address2: null,
              city: 'Austin',
              state: 'TX',
              zipCode: '75201',
            },
            phone: '555-0101',
          },
        ]),
        isSuccess: true,
        status: 'success',
      }),
    )

    render(<SearchExperience />)

    expect(screen.getByText('Results for ZIP 75201')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ada Lovelace')).toBeInTheDocument()

    mockReplace.mockClear()
    mockMutate.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Mock search form' }))

    expect(mockReplace).toHaveBeenCalledWith('/search?zipCode=75201&taxonomyDescription=Dentist')
    expect(mockMutate).toHaveBeenCalledWith({ zipCode: '75201', taxonomyDescription: 'Dentist' })
  })
})
