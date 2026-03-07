import { Suspense } from 'react'
import { StatisticsDashboard } from '@/components/statistics/statistics-dashboard'

export default function StatisticsPage() {
  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-4">
        <span className="inline-flex rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-medium text-[var(--brand-700)]">
          Analytics workspace
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-[var(--ink-900)]">
          See the shape of every provider search.
        </h1>
        <p className="text-lg leading-8 text-[var(--ink-600)]">
          Understand provider mix, specialty concentration, and geographic density before you export
          or refine the market.
        </p>
      </section>
      <Suspense fallback={null}>
        <StatisticsDashboard />
      </Suspense>
    </div>
  )
}
