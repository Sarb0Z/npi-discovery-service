import { Suspense } from 'react'
import { StatisticsDashboard } from '@/components/statistics/statistics-dashboard'

export default function StatisticsPage() {
  return (
    <div className="space-y-8 animate-page-enter">
      <section className="glass-panel max-w-4xl space-y-5 rounded-[32px] p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-700)]">
          Analytics workspace
        </span>
        <h1 className="text-display-lg text-[var(--ink-900)]">
          See the <span className="text-gradient-brand">shape, density, and mix</span> of every provider search.
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
