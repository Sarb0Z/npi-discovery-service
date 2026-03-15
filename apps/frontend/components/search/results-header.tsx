import type { SearchResponseDto } from '@npi/contracts'
import { Download, LayoutGrid, TableProperties } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { buildExportFileName, downloadCsv, downloadJson } from '@/lib/utils/export'

interface ResultsHeaderProps {
  locationLabel: string
  response: SearchResponseDto
}

export function ResultsHeader({ locationLabel, response }: ResultsHeaderProps) {
  const viewMode = useSearchStore((state) => state.viewMode)
  const setViewMode = useSearchStore((state) => state.setViewMode)
  const analyticsQuery = new URLSearchParams(
    Object.entries(response.metadata.searchParams).flatMap(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return []
      }

      return [[key, String(value)]]
    }),
  ).toString()

  const exportBaseName = buildExportFileName(
    locationLabel,
    String(
      response.metadata.searchParams.taxonomyDescription ??
        response.metadata.searchParams.taxonomyCode ??
        '',
    ),
  )

  return (
    <div className="flex flex-col gap-5 rounded-[30px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card)/0.86),hsl(var(--card)/0.68))] p-6 shadow-[var(--shadow-md)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{response.metadata.totalCount.toLocaleString()} providers</Badge>
          <Badge>{response.metadata.duration} ms</Badge>
          <Badge variant={response.metadata.complete ? 'success' : 'warning'}>
            {response.metadata.complete ? 'Complete coverage' : 'Partial coverage'}
          </Badge>
          {response.metadata.partitioned ? (
            <Badge>Partitioned x{response.metadata.partitionCount}</Badge>
          ) : null}
        </div>
        <div>
          <h2 className="text-display-sm text-[var(--ink-900)]">Results for {locationLabel}</h2>
          <p className="text-sm text-[var(--ink-600)]">
            Switch views, export the current result set, or open the analytics view for this query.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--surface)/0.82)] p-1 shadow-[var(--shadow-sm)]">
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'gradient' : 'ghost'}
            onClick={() => setViewMode('table')}
          >
            <TableProperties className="h-4 w-4" />
            Table
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'card' ? 'gradient' : 'ghost'}
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
        </div>
        <Button variant="secondary" onClick={() => downloadJson(response, exportBaseName)}>
          <Download className="h-4 w-4" />
          JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() => downloadCsv(response.providers, exportBaseName.replace('.json', '.csv'))}
        >
          <Download className="h-4 w-4" />
          CSV
        </Button>
        <Button asChild variant="outline">
          <Link href={`/statistics?${analyticsQuery}`}>View analytics</Link>
        </Button>
      </div>
    </div>
  )
}
