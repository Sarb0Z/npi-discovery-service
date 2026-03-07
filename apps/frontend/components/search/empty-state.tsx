import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  onReset: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--warning-soft)] text-[var(--warning-700)]">
          <SearchX className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-[var(--ink-900)]">No providers found</h3>
          <p className="max-w-xl text-sm leading-6 text-[var(--ink-600)]">
            Try broadening your search, removing a specialty filter, or switching from ZIP code to a wider state-based search.
          </p>
        </div>
        <Button variant="secondary" onClick={onReset}>
          Reset search
        </Button>
      </CardContent>
    </Card>
  )
}
