'use client'

import { useSearchParams } from 'next/navigation'
import { CitiesChart } from '@/components/statistics/cities-chart'
import { SpecialtiesChart } from '@/components/statistics/specialties-chart'
import { SummaryCards } from '@/components/statistics/summary-cards'
import { TaxonomyBreakdownTable } from '@/components/statistics/taxonomy-breakdown-table'
import { TypeDistributionChart } from '@/components/statistics/type-distribution-chart'
import { ErrorState } from '@/components/search/error-state'
import { SearchSkeleton } from '@/components/search/search-skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useStatistics } from '@/lib/hooks/use-provider-search'
import type { SearchFormValues } from '@/lib/schemas/search.schema'

function getValues(searchParams: URLSearchParams): SearchFormValues | null {
  const providerType = searchParams.get('providerType')
  const values: SearchFormValues = {
    zipCode: searchParams.get('zipCode') ?? '',
    city: searchParams.get('city') ?? '',
    state: searchParams.get('state') ?? '',
    taxonomyCode: searchParams.get('taxonomyCode') ?? '',
    taxonomyDescription: searchParams.get('taxonomyDescription') ?? '',
    providerType:
      providerType === '1' || providerType === '2' ? (Number(providerType) as 1 | 2) : undefined,
  }

  if (!values.zipCode && !values.state) {
    return null
  }

  return values
}

export function StatisticsDashboard() {
  const searchParams = useSearchParams()
  const values = getValues(searchParams)
  const { data, error, isLoading, refetch } = useStatistics(values)

  if (!values) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-[var(--ink-600)]">
          Start with a provider search, then open analytics to see market composition and specialty
          concentration.
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <SearchSkeleton />
  }

  if (error) {
    return <ErrorState error={error as never} onRetry={() => void refetch()} />
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <SummaryCards statistics={data} />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TypeDistributionChart statistics={data} />
        <CitiesChart statistics={data} />
      </div>
      <SpecialtiesChart statistics={data} />
      <TaxonomyBreakdownTable statistics={data} />
    </div>
  )
}
