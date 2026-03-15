import type { SearchResponseDto } from '@npi/contracts'
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Download,
  LayoutGrid,
  ScanSearch,
  TableProperties,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search-store'
import { buildExportFileName, downloadCsv, downloadJson } from '@/lib/utils/export'

interface ResultsHeaderProps {
  locationLabel: string
  response: SearchResponseDto
  showAnalytics?: boolean
  onToggleAnalytics?: () => void
}

export function ResultsHeader({
  locationLabel,
  response,
  showAnalytics,
  onToggleAnalytics,
}: ResultsHeaderProps) {
  const viewMode = useSearchStore((state) => state.viewMode)
  const setViewMode = useSearchStore((state) => state.setViewMode)

  const exportBaseName = buildExportFileName(
    locationLabel,
    String(
      response.metadata.searchParams.taxonomyDescription ??
        response.metadata.searchParams.taxonomyCode ??
        '',
    ),
  )

  const metrics = [
    ['Providers', response.metadata.totalCount.toLocaleString()],
    ['Latency', `${response.metadata.duration} ms`],
    ['Coverage', response.metadata.complete ? 'Complete' : 'Partial'],
  ] as const

  return (
    <div className="grid gap-6 rounded-[30px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card)/0.9),hsl(var(--card)/0.68))] p-6 shadow-[var(--shadow-md)] backdrop-blur-xl xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[22px] border border-[hsl(var(--border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--card)/0.72),hsl(var(--surface)/0.45))] px-4 py-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-500)]">
                {label}
              </p>
              <p className="font-display mt-3 text-xl font-semibold text-[var(--ink-900)]">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-500)]">
              <ScanSearch className="h-4 w-4" />
              Query workspace
            </div>
          <h2 className="text-display-sm text-[var(--ink-900)]">Results for {locationLabel}</h2>
          <p className="text-sm text-[var(--ink-600)]">
            Switch views, export the current result set, or open analytics without leaving the page.
          </p>
          </div>
          {response.metadata.partitioned ? (
            <div className="rounded-[20px] border border-[hsl(var(--secondary)/0.18)] bg-[hsl(var(--secondary)/0.08)] px-4 py-3 text-sm text-[var(--ink-700)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--ink-500)]">
                Deep search strategy
              </p>
              <p className="mt-2 font-medium">Partitioned across {response.metadata.partitionCount} query slices</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
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
        {onToggleAnalytics ? (
          <Button variant={showAnalytics ? 'gradient' : 'outline'} onClick={onToggleAnalytics}>
            <BarChart3 className="h-4 w-4" />
            Analytics
            {showAnalytics ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
