'use client'

import { ProviderType, type ProviderDto } from '@npi/contracts'
import { ArrowDownUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchStore } from '@/lib/stores/search-store'

interface ResultsTableProps {
  providers: ProviderDto[]
}

function compareValues(left: string, right: string, direction: 'asc' | 'desc'): number {
  return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
}

export function ResultsTable({ providers }: ResultsTableProps) {
  const sortField = useSearchStore((state) => state.sortField)
  const sortDirection = useSearchStore((state) => state.sortDirection)
  const setSort = useSearchStore((state) => state.setSort)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const sortedProviders = useMemo(() => {
    return [...providers].sort((left, right) => {
      const leftValue =
        sortField === 'city'
          ? left.address.city
          : sortField === 'state'
            ? left.address.state
            : left[sortField]
      const rightValue =
        sortField === 'city'
          ? right.address.city
          : sortField === 'state'
            ? right.address.state
            : right[sortField]

      return compareValues(String(leftValue), String(rightValue), sortDirection)
    })
  }, [providers, sortDirection, sortField])

  const pageCount = Math.max(1, Math.ceil(sortedProviders.length / pageSize))
  const visibleProviders = sortedProviders.slice((page - 1) * pageSize, page * pageSize)

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
          <thead className="bg-[var(--surface-100)] text-[var(--ink-600)]">
            <tr>
              {[
                ['name', 'Name'],
                ['npi', 'NPI'],
                ['primarySpecialty', 'Specialty'],
                ['city', 'City'],
                ['state', 'State'],
              ].map(([field, label]) => (
                <th key={field} className="px-6 py-4 font-medium">
                  <button
                    className="inline-flex items-center gap-2"
                    onClick={() => setSort(field as never)}
                    type="button"
                  >
                    {label}
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
              ))}
              <th className="px-6 py-4 font-medium">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] bg-white">
            {visibleProviders.map((provider) => (
              <tr key={provider.npi} className="transition hover:bg-[var(--surface-100)]">
                <td className="px-6 py-4 font-medium text-[var(--ink-900)]">{provider.name}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{provider.npi}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{provider.primarySpecialty}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{provider.address.city}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{provider.address.state}</td>
                <td className="px-6 py-4">
                  <Badge
                    variant={provider.type === ProviderType.Individual ? 'primary' : 'success'}
                  >
                    {provider.type === ProviderType.Individual ? 'Individual' : 'Organization'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-6 py-4">
          <p className="text-sm text-[var(--ink-600)]">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page === 1}
              size="sm"
              variant="secondary"
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={page === pageCount}
              size="sm"
              variant="secondary"
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
