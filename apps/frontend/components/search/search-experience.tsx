'use client'

import { motion } from 'framer-motion'
import { BarChart3, Compass, Sparkles, type LucideIcon } from 'lucide-react'
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
  const highlights: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: Compass,
      title: 'Reliable',
      description: 'Graceful handling for partitioned and partial NPPES results',
    },
    {
      icon: Sparkles,
      title: 'Fast',
      description: 'Recent searches, exports, and map context stay inside one workflow',
    },
    {
      icon: BarChart3,
      title: 'Clear',
      description: 'State, specialty, and provider-type controls lead directly into analytics',
    },
  ]

  return (
    <div className="space-y-8 animate-page-enter">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="relative overflow-hidden rounded-[32px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card)/0.86),hsl(var(--card)/0.64))] p-8 shadow-[var(--shadow-lg)] backdrop-blur-2xl sm:p-10">
          <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-[hsl(var(--primary)/0.14)] blur-3xl" />
          <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-[hsl(var(--secondary)/0.14)] blur-3xl" />
          <div className="absolute right-20 top-12 h-3 w-3 rounded-full bg-[hsl(var(--secondary))] animate-float" />
          <div className="absolute right-10 top-28 h-2 w-2 rounded-full bg-[hsl(var(--tertiary))] animate-drift-x" />
          <div className="relative space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-700)] ring-1 ring-[hsl(var(--secondary)/0.16)]">
              <Sparkles className="h-4 w-4" />
              Built for broad discovery and rapid filtering
            </span>
            <h1 className="text-display-xl max-w-4xl text-[var(--ink-900)]">
              Search the national provider registry with a{' '}
              <span className="text-gradient-brand">stunning, fluid operator experience.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ink-600)] sm:text-xl">
              Move from state-wide market scans to exact ZIP-level provider discovery, then pivot into
              analytics without breaking flow, losing context, or settling for flat enterprise UI.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              className="glass-panel group rounded-[28px] p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--secondary)/0.18),hsl(var(--tertiary)/0.18))] text-[hsl(var(--ink-900))] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-[var(--ink-900)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">{description}</p>
                </div>
              </div>
            </motion.div>
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
              {data.providers.map((provider, index) => (
                <motion.div
                  key={provider.npi}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.18) }}
                >
                  <ProviderCard provider={provider} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      ) : null}
    </div>
  )
}
