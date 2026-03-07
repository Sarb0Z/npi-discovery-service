import type { BulkJobResponseDto } from '@npi/contracts'
import { LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BulkStatusProps {
  job: BulkJobResponseDto
}

export function BulkStatus({ job }: BulkStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk job in progress</CardTitle>
        <CardDescription>File generation runs asynchronously on the backend.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="warning">{job.status}</Badge>
          <code className="rounded-full bg-[var(--surface-200)] px-3 py-1 text-sm text-[var(--ink-700)]">
            {job.jobId}
          </code>
        </div>
        <div className="rounded-3xl bg-[var(--surface-100)] p-4">
          <div className="mb-3 flex items-center gap-3 text-sm text-[var(--ink-700)]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {job.message}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,var(--brand-600),var(--accent-500))]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
