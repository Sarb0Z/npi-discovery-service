'use client'

import { motion } from 'framer-motion'
import { CitiesChart } from '@/components/statistics/cities-chart'
import { SpecialtiesChart } from '@/components/statistics/specialties-chart'
import { SummaryCards } from '@/components/statistics/summary-cards'
import { TaxonomyBreakdownTable } from '@/components/statistics/taxonomy-breakdown-table'
import { TypeDistributionChart } from '@/components/statistics/type-distribution-chart'
import { SearchSkeleton } from '@/components/search/search-skeleton'
import { useStatistics } from '@/lib/hooks/use-provider-search'
import type { SearchFormValues } from '@/lib/schemas/search.schema'

interface ResultsAnalyticsPanelProps {
  searchValues: Partial<SearchFormValues>
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function ResultsAnalyticsPanel({ searchValues }: ResultsAnalyticsPanelProps) {
  const values: SearchFormValues | null =
    searchValues.zipCode || searchValues.state
      ? {
          npi: searchValues.npi ?? '',
          zipCode: searchValues.zipCode ?? '',
          city: searchValues.city ?? '',
          state: searchValues.state ?? '',
          taxonomyCode: searchValues.taxonomyCode ?? '',
          taxonomyDescription: searchValues.taxonomyDescription ?? '',
          providerType: searchValues.providerType,
        }
      : null

  const { data, isLoading } = useStatistics(values)

  if (isLoading) {
    return <SearchSkeleton />
  }

  if (!data) {
    return null
  }

  return (
    <motion.div className="space-y-6 pt-2" variants={stagger} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <SummaryCards statistics={data} />
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TypeDistributionChart statistics={data} />
        <CitiesChart statistics={data} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <SpecialtiesChart statistics={data} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <TaxonomyBreakdownTable statistics={data} />
      </motion.div>
    </motion.div>
  )
}
