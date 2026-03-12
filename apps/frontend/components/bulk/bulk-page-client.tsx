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
    <div className="space-y-8 animate-page-enter">
      <section className="glass-panel max-w-4xl space-y-5 rounded-[32px] p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-[var(--warning-soft)] px-4 py-2 text-sm font-medium text-[var(--warning-700)]">
          Bulk collection writes files asynchronously on the API host
        </span>
        <h1 className="text-display-lg text-[var(--ink-900)]">
          Capture provider datasets for <span className="text-gradient-brand">downstream analysis at scale.</span>
        </h1>
        <p className="text-lg leading-8 text-[var(--ink-600)]">
          Use the same discovery filters, then hand the backend a large collection job optimized for
          partitioned NPPES retrieval.
        </p>
      </section>

      <Card className="border-[hsl(var(--warning)/0.2)] bg-[linear-gradient(135deg,hsl(var(--warning)/0.16),hsl(var(--card)/0.9))]">
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
