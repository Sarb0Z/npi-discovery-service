import type { Payload } from 'recharts/types/component/DefaultTooltipContent'

interface ChartTooltipProps {
  active?: boolean
  payload?: Payload<number, string>[]
  /** Label shown above the value row — defaults to the Recharts payload name */
  label?: string
  /** Format the numeric value — defaults to toLocaleString() */
  formatValue?: (value: number) => string
  /** Unit appended after the value (e.g. "providers", "%") */
  unit?: string
  /** Color dot shown beside the label — pulled from payload fill by default */
  color?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  unit,
  color,
}: ChartTooltipProps) {
  const entry = active ? payload?.[0] : undefined
  if (!entry) {
    return null
  }

  const value = typeof entry.value === 'number' ? entry.value : 0
  const displayValue = formatValue ? formatValue(value) : value.toLocaleString()
  const entryPayload = entry.payload as Record<string, unknown> | undefined
  const dotColor = color ?? (entryPayload?.fill as string | undefined) ?? 'hsl(var(--primary))'
  const displayLabel = label ?? entry.name ?? ''

  return (
    <div className="pointer-events-none min-w-[140px] rounded-[var(--radius-md)] border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--popover)/0.96)] px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-xl">
      {displayLabel ? (
        <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--ink-500))]">
          {displayLabel}
        </p>
      ) : null}
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dotColor }} />
        <span className="font-display text-lg font-semibold text-[hsl(var(--ink-900))]">
          {displayValue}
        </span>
        {unit ? <span className="text-xs text-[hsl(var(--ink-500))]">{unit}</span> : null}
      </div>
    </div>
  )
}

/** Pie-chart variant that shows both name and percentage. */
interface PieChartTooltipProps {
  active?: boolean
  payload?: Payload<number, string>[]
  total: number
}

export function PieChartTooltip({ active, payload, total }: PieChartTooltipProps) {
  const entry = active ? payload?.[0] : undefined
  if (!entry) {
    return null
  }

  const value = typeof entry.value === 'number' ? entry.value : 0
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  const entryPayload = entry.payload as Record<string, unknown> | undefined
  const fill = (entryPayload?.fill as string | undefined) ?? 'hsl(var(--primary))'

  return (
    <div className="pointer-events-none min-w-[160px] rounded-[var(--radius-md)] border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--popover)/0.96)] px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-xl">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--ink-500))]">
        {entry.name}
      </p>
      <div className="flex items-baseline gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: fill }} />
        <span className="font-display text-lg font-semibold text-[hsl(var(--ink-900))]">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-[hsl(var(--ink-500))]">({pct}%)</span>
      </div>
    </div>
  )
}
