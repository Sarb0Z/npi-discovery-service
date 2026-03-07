import type { StatisticsResponseDto } from '@npi/contracts'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TypeDistributionChartProps {
  statistics: StatisticsResponseDto
}

const COLORS = ['#2563eb', '#0f9f74']

export function TypeDistributionChart({ statistics }: TypeDistributionChartProps) {
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
            <Pie
              data={statistics.providerTypeDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={78}
              outerRadius={112}
              paddingAngle={4}
            >
              {statistics.providerTypeDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
