'use client'

import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { EmptyState } from '@/components/search/empty-state'
import { ErrorState } from '@/components/search/error-state'
import { ProviderCard } from '@/components/search/provider-card'
import { ProviderMap } from '@/components/search/provider-map'
import { ResultsHeader } from '@/components/search/results-header'
import { ResultsTable } from '@/components/search/results-table'
import { SearchForm } from '@/components/search/search-form'
import { SearchSkeleton } from '@/components/search/search-skeleton'
import { FrontendApiError } from '@/lib/api/providers'
import { useProviderSearch } from '@/lib/hooks/use-provider-search'
import type { SearchFormValues } from '@/lib/schemas/search.schema'
import { useSearchStore } from '@/lib/stores/search-store'

function getInitialValues(searchParams: URLSearchParams): Partial<SearchFormValues> {
  const providerType = searchParams.get('providerType')

  return {
    npi: searchParams.get('npi') ?? '',
    zipCode: searchParams.get('zipCode') ?? '',
    city: searchParams.get('city') ?? '',
    state: searchParams.get('state') ?? '',
    taxonomyCode: searchParams.get('taxonomyCode') ?? '',
    taxonomyDescription: searchParams.get('taxonomyDescription') ?? '',
    providerType:
      providerType === '1' || providerType === '2' ? (Number(providerType) as 1 | 2) : undefined,
  }
}

function buildLocationLabel(values: Partial<SearchFormValues>): string {
  if (values.npi) {
    return `NPI ${values.npi}`
  }

  if (values.zipCode) {
    return `ZIP ${values.zipCode}`
  }

  if (values.city && values.state) {
    return `${values.city}, ${values.state}`
  }

  return values.state ?? 'your query'
}

export function SearchExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate, data, error, isPending } = useProviderSearch()
  const viewMode = useSearchStore((state) => state.viewMode)
  const initialValues = useMemo(() => getInitialValues(searchParams), [searchParams])

  useEffect(() => {
    if (initialValues.npi || initialValues.zipCode || initialValues.state) {
      mutate(initialValues)
    }
  }, [initialValues, mutate])

  const handleSubmit = (values: SearchFormValues) => {
    const query = new URLSearchParams(
      Object.entries(values).flatMap(([key, value]) => {
        if (value === undefined || value === '') {
          return []
        }

        return [[key, String(value)]]
      }),
    )

    router.replace(`/search?${query.toString()}`)
    mutate(values)
  }

  const locationLabel = buildLocationLabel(initialValues)
  const apiError = error instanceof FrontendApiError ? error.payload : null

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-5 pt-6">
          <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent-700)]">
            Built for broad discovery and rapid filtering
          </span>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-[var(--ink-900)] sm:text-6xl">
            Search the national provider registry with a frontend people will actually want to use.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--ink-600)]">
            Move from state-wide market scans to exact ZIP-level provider discovery, then pivot into
            analytics without leaving the flow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Reliable', 'Graceful handling for partitioned and partial NPPES results'],
            ['Fast', 'Optimized for exploration with recent searches and export paths'],
            ['Clear', 'Strong state, specialty, and provider-type controls with analytics'],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-[28px] border border-[var(--line)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-semibold text-[var(--ink-900)]">{title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <SearchForm defaultValues={initialValues} isSubmitting={isPending} onSubmit={handleSubmit} />

      {isPending ? <SearchSkeleton /> : null}

      {apiError ? <ErrorState error={apiError} onRetry={() => mutate(initialValues)} /> : null}

      {!isPending && data?.providers.length === 0 ? (
        <EmptyState onReset={() => router.replace('/search')} />
      ) : null}

      {!isPending && data?.providers.length ? (
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResultsHeader locationLabel={locationLabel} response={data} />
          <ProviderMap providers={data.providers} />
          {viewMode === 'table' ? (
            <ResultsTable providers={data.providers} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.providers.map((provider) => (
                <ProviderCard key={provider.npi} provider={provider} />
              ))}
            </div>
          )}
        </motion.section>
      ) : null}
    </div>
  )
}
