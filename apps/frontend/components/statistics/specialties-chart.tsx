import type { StatisticsResponseDto } from '@npi/contracts'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SpecialtiesChartProps {
  statistics: StatisticsResponseDto
}

export function SpecialtiesChart({ statistics }: SpecialtiesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top specialties</CardTitle>
        <CardDescription>The most common primary specialties in this query.</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={statistics.topSpecialties}
            layout="vertical"
            margin={{ left: 18, right: 16 }}
          >
            <defs>
              <linearGradient id="specialtiesFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--tertiary))" />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="description" type="category" width={140} />
            <Tooltip />
            <Bar dataKey="count" fill="url(#specialtiesFill)" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
