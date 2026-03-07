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
            <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="description" type="category" width={140} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
