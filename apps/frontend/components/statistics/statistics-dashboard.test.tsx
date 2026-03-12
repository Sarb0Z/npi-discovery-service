import { ApiErrorCode, type StatisticsResponseDto } from '@npi/contracts'
import { fireEvent, render, screen } from '@testing-library/react'
import { StatisticsDashboard } from '@/components/statistics/statistics-dashboard'
import type { useStatistics as useStatisticsHook } from '@/lib/hooks/use-provider-search'

const mockUseSearchParams = jest.fn<URLSearchParams, []>()
const mockUseStatistics = jest.fn<ReturnType<typeof useStatisticsHook>, [unknown]>()
const mockRefetch = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div data-testid="chart-tooltip" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}))

jest.mock('@/lib/hooks/use-provider-search', () => ({
  useStatistics: (values: unknown) => mockUseStatistics(values),
}))

function buildStatistics(): StatisticsResponseDto {
  return {
    summary: {
      totalProviders: 125,
      individualCount: 90,
      organizationCount: 35,
      multipleTaxonomiesCount: 12,
      uniqueCitiesCount: 8,
    },
    providerTypeDistribution: [
      { name: 'Individual', value: 90 },
      { name: 'Organization', value: 35 },
    ],
    topSpecialties: [
      { description: 'Dentist', count: 30, percentage: 24 },
      { description: 'Family Medicine', count: 22, percentage: 17.6 },
    ],
    topCities: [
      { name: 'Austin', count: 15 },
      { name: 'Dallas', count: 11 },
    ],
    taxonomyBreakdown: [
      { code: '1223G0001X', description: 'Dentist', count: 30, percentage: 24 },
      { code: '207Q00000X', description: 'Family Medicine', count: 22, percentage: 17.6 },
    ],
  }
}

describe('StatisticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRefetch.mockReset()
  })

  it('shows guidance when there is no active search', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    mockUseStatistics.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    })

    render(<StatisticsDashboard />)

    expect(
      screen.getByText(
        /Start with a provider search, then open analytics to see market composition/i,
      ),
    ).toBeInTheDocument()
  })

  it('renders loading and error states for statistics requests', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('state=TX'))
    mockUseStatistics.mockReturnValueOnce({
      data: undefined,
      error: null,
      isLoading: true,
      refetch: mockRefetch,
    })

    const { container, rerender } = render(<StatisticsDashboard />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    mockUseStatistics.mockReturnValue({
      data: undefined,
      error: {
        code: ApiErrorCode.NppesUnavailable,
        message: 'Downstream failure',
        timestamp: '2026-03-07T00:00:00.000Z',
      },
      isLoading: false,
      refetch: mockRefetch,
    })

    rerender(<StatisticsDashboard />)

    expect(
      screen.getByText(
        'The national provider registry is temporarily unavailable. Please retry in a moment.',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retry search' }))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('renders summary cards and charts when statistics load successfully', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('state=TX&providerType=1'))
    mockUseStatistics.mockReturnValue({
      data: buildStatistics(),
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    })

    render(<StatisticsDashboard />)

    expect(screen.getByText('Total Providers')).toBeInTheDocument()
    expect(screen.getByText('Provider type split')).toBeInTheDocument()
    expect(screen.getByText('Top cities')).toBeInTheDocument()
    expect(screen.getByText('Top specialties')).toBeInTheDocument()
    expect(screen.getByText('Taxonomy breakdown')).toBeInTheDocument()
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /count/i }))
    expect(screen.getByText('1223G0001X')).toBeInTheDocument()
  })
})
