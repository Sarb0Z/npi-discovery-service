'use client'

import { ProviderType, type ProviderDto } from '@npi/contracts'
import { ArrowDownUp } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
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
  const [pageSize, setPageSize] = useState(10)
  const [expandedProviderNpi, setExpandedProviderNpi] = useState<string | null>(null)

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
  const currentPage = Math.min(page, pageCount)
  const visibleProviders = sortedProviders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function toggleExpandedProvider(npi: string): void {
    setExpandedProviderNpi((currentNpi) => (currentNpi === npi ? null : npi))
  }

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
          <p className="text-sm text-[var(--ink-600)]">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, sortedProviders.length)}{' '}
            of {sortedProviders.length.toLocaleString()} providers
          </p>
          <label
            className="flex items-center gap-3 text-sm text-[var(--ink-600)]"
            htmlFor="results-page-size"
          >
            Rows per page
            <select
              className="rounded-[14px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.84)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none transition focus:border-[hsl(var(--primary)/0.6)]"
              id="results-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
            >
              {[10, 25, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
          <thead className="bg-[hsl(var(--surface)/0.72)] text-[var(--ink-600)]">
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
              <th className="px-6 py-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] bg-[hsl(var(--card)/0.72)]">
            {visibleProviders.map((provider) => {
              const isExpanded = expandedProviderNpi === provider.npi

              return (
                <Fragment key={provider.npi}>
                  <tr className="transition hover:bg-[linear-gradient(90deg,hsl(var(--primary)/0.06),transparent_70%)]">
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
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleExpandedProvider(provider.npi)}
                      >
                        {isExpanded ? 'Hide details' : 'Show details'}
                      </Button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="bg-[hsl(var(--surface)/0.82)]">
                      <td className="px-6 py-5" colSpan={7}>
                        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-500)]">
                                Practice location
                              </p>
                              <div className="mt-2 space-y-1 text-sm text-[var(--ink-700)]">
                                <p>{provider.address.address1}</p>
                                {provider.address.address2 ? (
                                  <p>{provider.address.address2}</p>
                                ) : null}
                                <p>
                                  {provider.address.city}, {provider.address.state}{' '}
                                  {provider.address.zipCode}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-500)]">
                                Contact
                              </p>
                              <p className="mt-2 text-sm text-[var(--ink-700)]">
                                {provider.phone ?? 'No phone on record'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-500)]">
                              Taxonomies
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {provider.taxonomies.map((taxonomy) => (
                                <Badge
                                  key={`${provider.npi}-${taxonomy.code}-${taxonomy.description}`}
                                  variant={taxonomy.primary ? 'primary' : 'neutral'}
                                >
                                  {taxonomy.description} ({taxonomy.code})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-6 py-4">
          <p className="text-sm text-[var(--ink-600)]">
            Page {currentPage} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              size="sm"
              variant="secondary"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === pageCount}
              size="sm"
              variant="secondary"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
