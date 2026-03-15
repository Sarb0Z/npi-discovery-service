import type { StatisticsResponseDto } from '@npi/contracts'
import { Building2, Layers3, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
      {items.map((item, index) => {
        const Icon = item.icon
        const value = statistics.summary[item.key]
        const gradients = [
          'from-[hsl(var(--primary)/0.22)] to-[hsl(var(--primary)/0.06)]',
          'from-[hsl(var(--secondary)/0.22)] to-[hsl(var(--secondary)/0.06)]',
          'from-[hsl(var(--tertiary)/0.22)] to-[hsl(var(--tertiary)/0.06)]',
          'from-[hsl(var(--info)/0.2)] to-[hsl(var(--info)/0.06)]',
          'from-[hsl(var(--warning)/0.2)] to-[hsl(var(--warning)/0.06)]',
        ]

        return (
          <Card key={item.key} className="overflow-hidden">
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--ink-500)]">{item.label}</p>
                <p className="font-display mt-3 text-3xl font-semibold text-[var(--ink-900)]">
                  {value.toLocaleString()}
                </p>
              </div>
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-[var(--ink-900)]',
                  gradients[index % gradients.length],
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
