import type { StatisticsResponseDto } from '@npi/contracts'
import { Building2, Layers3, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SummaryCardsProps {
  statistics: StatisticsResponseDto
}

const items = [
  { key: 'totalProviders', label: 'Total Providers', icon: Users },
  { key: 'individualCount', label: 'Individuals', icon: Users },
  { key: 'organizationCount', label: 'Organizations', icon: Building2 },
  { key: 'multipleTaxonomiesCount', label: 'Multi-Taxonomy', icon: Layers3 },
  { key: 'uniqueCitiesCount', label: 'Cities Covered', icon: MapPin },
] as const

export function SummaryCards({ statistics }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon
        const value = statistics.summary[item.key]

        return (
          <Card key={item.key}>
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--ink-500)]">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--ink-900)]">{value.toLocaleString()}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-200)] text-[var(--brand-700)]">
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
