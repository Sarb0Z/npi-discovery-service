import type { ApiErrorResponse } from '@npi/contracts'
import { ApiErrorCode } from '@npi/contracts'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorStateProps {
  error: ApiErrorResponse
  onRetry: () => void
}

function getErrorMessage(error: ApiErrorResponse): string {
  if (error.code === ApiErrorCode.NppesUnavailable) {
    return 'The national provider registry is temporarily unavailable. Please retry in a moment.'
  }

  if (error.code === ApiErrorCode.RateLimited) {
    return 'The upstream registry is rate limiting requests. Give it a few seconds, then retry.'
  }

  if (error.code === ApiErrorCode.ValidationError) {
    return error.details?.join(' ') ?? error.message
  }

  return error.message
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--warning-soft)] text-[var(--warning-700)]">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-[var(--ink-900)]">Search unavailable</h3>
          <p className="max-w-xl text-sm leading-6 text-[var(--ink-600)]">{getErrorMessage(error)}</p>
        </div>
        <Button onClick={onRetry}>Retry search</Button>
      </CardContent>
    </Card>
  )
}
