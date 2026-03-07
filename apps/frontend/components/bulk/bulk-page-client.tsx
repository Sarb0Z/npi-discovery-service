'use client'

import { useState } from 'react'
import { BulkStatus } from '@/components/bulk/bulk-status'
import { SearchForm } from '@/components/search/search-form'
import { Card, CardContent } from '@/components/ui/card'
import { useBulkCollection } from '@/lib/hooks/use-provider-search'
import type { BulkFormValues } from '@/lib/schemas/search.schema'

export function BulkPageClient() {
  const { mutateAsync, isPending } = useBulkCollection()
  const [jobId, setJobId] = useState<Awaited<ReturnType<typeof mutateAsync>> | null>(null)

  const handleSubmit = async (values: BulkFormValues) => {
    const response = await mutateAsync(values)
    setJobId(response)
  }

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-4">
        <span className="inline-flex rounded-full bg-[var(--warning-soft)] px-3 py-1 text-sm font-medium text-[var(--warning-700)]">
          Bulk collection writes files asynchronously on the API host
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-[var(--ink-900)]">
          Capture provider datasets for downstream analysis.
        </h1>
        <p className="text-lg leading-8 text-[var(--ink-600)]">
          Use the same discovery filters, then hand the backend a large collection job optimized for
          partitioned NPPES retrieval.
        </p>
      </section>

      <Card className="border-[var(--warning-soft)] bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(255,255,255,0.82))]">
        <CardContent className="py-5 text-sm leading-7 text-[var(--ink-700)]">
          Large state-wide collections can take several minutes and may return partial coverage when
          the upstream registry still exceeds its retrievable ceiling on fully refined branches.
        </CardContent>
      </Card>

      <SearchForm
        isSubmitting={isPending}
        onSubmit={(values) => void handleSubmit(values as BulkFormValues)}
        submitLabel="Start bulk collection"
        variant="bulk"
      />
      {jobId ? <BulkStatus job={jobId} /> : null}
    </div>
  )
}
