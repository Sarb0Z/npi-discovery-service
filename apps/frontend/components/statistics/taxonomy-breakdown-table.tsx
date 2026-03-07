'use client'

import type { StatisticsResponseDto, TaxonomyBreakdownItem } from '@npi/contracts'
import { ArrowDownUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SortField = 'description' | 'code' | 'count' | 'percentage'
type SortDirection = 'asc' | 'desc'

interface TaxonomyBreakdownTableProps {
  statistics: StatisticsResponseDto
}

function compareText(left: string, right: string, direction: SortDirection): number {
  return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
}

function compareNumber(left: number, right: number, direction: SortDirection): number {
  return direction === 'asc' ? left - right : right - left
}

export function TaxonomyBreakdownTable({ statistics }: TaxonomyBreakdownTableProps) {
  const [sortField, setSortField] = useState<SortField>('count')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const rows = useMemo(() => {
    return [...statistics.taxonomyBreakdown].sort(
      (left: TaxonomyBreakdownItem, right: TaxonomyBreakdownItem) => {
        if (sortField === 'count' || sortField === 'percentage') {
          return compareNumber(left[sortField], right[sortField], sortDirection)
        }

        return compareText(left[sortField], right[sortField], sortDirection)
      },
    )
  }, [sortDirection, sortField, statistics.taxonomyBreakdown])

  function updateSort(nextField: SortField): void {
    setSortDirection((currentDirection) => {
      if (sortField !== nextField) {
        return nextField === 'description' || nextField === 'code' ? 'asc' : 'desc'
      }

      return currentDirection === 'asc' ? 'desc' : 'asc'
    })
    setSortField(nextField)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxonomy breakdown</CardTitle>
        <CardDescription>
          Every taxonomy represented in the result set, including multi-specialty providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
          <thead className="bg-[var(--surface-100)] text-[var(--ink-600)]">
            <tr>
              {[
                ['description', 'Description'],
                ['code', 'Code'],
                ['count', 'Count'],
                ['percentage', 'Coverage'],
              ].map(([field, label]) => (
                <th key={field} className="px-6 py-4 font-medium">
                  <button
                    className="inline-flex items-center gap-2"
                    type="button"
                    onClick={() => updateSort(field as SortField)}
                  >
                    {label}
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] bg-white">
            {rows.map((taxonomy) => (
              <tr key={`${taxonomy.code}-${taxonomy.description}`}>
                <td className="px-6 py-4 font-medium text-[var(--ink-900)]">{taxonomy.description}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{taxonomy.code}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{taxonomy.count.toLocaleString()}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{taxonomy.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}