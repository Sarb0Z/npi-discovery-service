'use client'

import type { StatisticsResponseDto } from '@npi/contracts'
import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChartTooltip } from '@/components/statistics/chart-tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TypeDistributionChartProps {
  statistics: StatisticsResponseDto
}

export function TypeDistributionChart({ statistics }: TypeDistributionChartProps) {
  const total = useMemo(
    () => statistics.providerTypeDistribution.reduce((sum, d) => sum + d.value, 0),
    [statistics.providerTypeDistribution],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider type split</CardTitle>
        <CardDescription>
          Individuals versus organizations in the current result set.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="typeIndividual" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--info))" />
              </linearGradient>
              <linearGradient id="typeOrg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--tertiary))" />
              </linearGradient>
            </defs>
            <Pie
              data={statistics.providerTypeDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={78}
              outerRadius={112}
              paddingAngle={4}
            >
              {statistics.providerTypeDistribution.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={index === 0 ? 'url(#typeIndividual)' : 'url(#typeOrg)'}
                />
              ))}
            </Pie>
            <Tooltip content={<PieChartTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
