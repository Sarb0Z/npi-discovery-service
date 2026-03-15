'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '@/components/search/empty-state'
import { ErrorState } from '@/components/search/error-state'
import { ProviderCard } from '@/components/search/provider-card'
import { ProviderMap } from '@/components/search/provider-map'
import { ResultsAnalyticsPanel } from '@/components/search/results-analytics-panel'
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
  const [showAnalytics, setShowAnalytics] = useState(false)

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

    router.replace(`/?${query.toString()}`)
    mutate(values)
    setShowAnalytics(false)
  }

  const locationLabel = buildLocationLabel(initialValues)
  const apiError = error instanceof FrontendApiError ? error.payload : null

  return (
    <div className="animate-page-enter space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-[hsl(var(--border)/0.7)] bg-[linear-gradient(168deg,hsl(var(--card)/0.94),hsl(var(--card)/0.68)_62%,hsl(var(--surface)/0.52))] px-8 py-8 shadow-[var(--shadow-lg)] backdrop-blur-2xl sm:px-10 sm:py-10">
        {/* Decorative gradient orbs */}
        <div className="deco-orb absolute -left-16 -top-8 h-56 w-56 rounded-full bg-[hsl(var(--primary)/0.2)] blur-[80px]" />
        <div
          className="deco-orb absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[hsl(var(--secondary)/0.22)] blur-[70px]"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="deco-orb absolute left-1/3 top-0 h-36 w-36 rounded-full bg-[hsl(var(--tertiary)/0.16)] blur-[60px]"
          style={{ animationDelay: '4s' }}
        />
        <div className="absolute -right-6 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[hsl(280_80%_65%/0.14)] blur-[55px]" />

        {/* Decorative ring */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-2 border-dashed border-[hsl(var(--primary)/0.12)] opacity-60" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-[hsl(var(--secondary)/0.1)]" />

        {/* Floating particles */}
        <div className="animate-float absolute right-[15%] top-[18%] h-3 w-3 rounded-full bg-[hsl(var(--secondary))]" />
        <div className="animate-drift-x absolute bottom-[20%] left-[10%] h-2.5 w-2.5 rounded-full bg-[hsl(var(--tertiary))]" />
        <div
          className="animate-float absolute right-[8%] top-[55%] h-2 w-2 rounded-full bg-[hsl(var(--primary)/0.7)]"
          style={{ animationDelay: '1.4s' }}
        />
        <div
          className="animate-drift-x absolute left-[40%] top-[10%] h-1.5 w-1.5 rounded-full bg-[hsl(280_80%_65%/0.6)]"
          style={{ animationDelay: '3s' }}
        />

        {/* Diamond decoration */}
        <div className="absolute right-[25%] top-4 h-4 w-4 rotate-45 rounded-sm bg-[linear-gradient(135deg,hsl(var(--primary)/0.3),hsl(var(--secondary)/0.3))]" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--ink-500)]">
              <span>Registry search</span>
              <span className="h-px w-10 bg-[linear-gradient(90deg,hsl(var(--primary)/0.55),transparent)]" />
              <span>Live analytics</span>
            </div>
            <h1 className="text-display-lg max-w-3xl text-[var(--ink-900)]">
              Search, analyze, and export{' '}
              <span className="text-gradient-brand">every healthcare provider</span> in one flow.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--ink-600)] sm:text-lg">
              Built like an instrument panel, not a marketing page. Broad discovery, exact lookup,
              embedded analytics, and export all live in the same workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
          >
            {[
              ['Search modes', 'NPI, ZIP, city/state, statewide'],
              ['Response shape', 'Mapped providers, charts, exports'],
              ['Workflow', 'Search first, analyze inline, export on demand'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[24px] border border-[hsl(var(--border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--card)/0.74),hsl(var(--surface)/0.4))] px-4 py-4 backdrop-blur-xl"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--ink-500)]">
                  {label}
                </p>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--ink-900)]">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Search form ── */}
      <SearchForm defaultValues={initialValues} isSubmitting={isPending} onSubmit={handleSubmit} />

      {/* ── Loading state ── */}
      {isPending ? <SearchSkeleton /> : null}

      {/* ── Error state ── */}
      {apiError ? <ErrorState error={apiError} onRetry={() => mutate(initialValues)} /> : null}

      {/* ── Empty state ── */}
      {!isPending && data?.providers.length === 0 ? (
        <EmptyState onReset={() => router.replace('/')} />
      ) : null}

      {/* ── Results ── */}
      {!isPending && data?.providers.length ? (
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResultsHeader
            locationLabel={locationLabel}
            response={data}
            showAnalytics={showAnalytics}
            onToggleAnalytics={() => setShowAnalytics((prev) => !prev)}
          />

          {/* ── Inline analytics panel ── */}
          <AnimatePresence>
            {showAnalytics ? (
              <motion.div
                key="analytics-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ResultsAnalyticsPanel searchValues={initialValues} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ── Gradient section divider ── */}
          <div className="mx-auto h-px w-3/4 bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.3),hsl(var(--secondary)/0.3),hsl(var(--tertiary)/0.3),transparent)]" />

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
