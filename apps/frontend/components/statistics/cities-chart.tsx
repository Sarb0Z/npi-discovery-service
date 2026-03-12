import type { StatisticsResponseDto } from '@npi/contracts'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CitiesChartProps {
  statistics: StatisticsResponseDto
}

export function CitiesChart({ statistics }: CitiesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top cities</CardTitle>
        <CardDescription>Where the densest provider clusters appear.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statistics.topCities} margin={{ left: 0, right: 16 }}>
            <defs>
              <linearGradient id="citiesFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--info))" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="url(#citiesFill)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
