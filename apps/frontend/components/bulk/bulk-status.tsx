'use client'

import { type BulkJobProgressDto, type BulkJobResponseDto } from '@npi/contracts'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BULK_JOB_NAMESPACE,
  BULK_JOB_PROGRESS_EVENT,
  BULK_JOB_SUBSCRIBE_EVENT,
} from '@/lib/constants/bulk-jobs'

interface BulkStatusProps {
  job: BulkJobResponseDto
}

function createInitialProgress(job: BulkJobResponseDto): BulkJobProgressDto {
  return {
    ...job,
    totalProvidersFound: 0,
    collectedProviders: 0,
    estimatedRemainingProviders: 0,
  }
}

export function BulkStatus({ job }: BulkStatusProps) {
  const [socketProgress, setSocketProgress] = useState<BulkJobProgressDto | null>(null)
  const liveJob = socketProgress?.jobId === job.jobId ? socketProgress : createInitialProgress(job)

  useEffect(() => {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    )
    const socket = io(`${apiBaseUrl}/${BULK_JOB_NAMESPACE}`, {
      auth: { jobId: job.jobId },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      socket.emit(BULK_JOB_SUBSCRIBE_EVENT, { jobId: job.jobId })
    })

    socket.on(BULK_JOB_PROGRESS_EVENT, (event: BulkJobProgressDto) => {
      if (event.jobId !== job.jobId) {
        return
      }

      setSocketProgress(event)
    })

    return () => {
      socket.disconnect()
    }
  }, [job.jobId])

  const progressPercent =
    liveJob.totalProvidersFound > 0
      ? Math.round((liveJob.collectedProviders / liveJob.totalProvidersFound) * 100)
      : liveJob.status === 'COMPLETED'
        ? 100
        : liveJob.status === 'FAILED'
          ? 100
          : 15

  const badgeVariant =
    liveJob.status === 'COMPLETED' ? 'success' : liveJob.status === 'FAILED' ? 'neutral' : 'warning'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk job in progress</CardTitle>
        <CardDescription>File generation runs asynchronously on the backend.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={badgeVariant}>{liveJob.status}</Badge>
          <code className="rounded-full bg-[hsl(var(--surface-hover))] px-3 py-1 text-sm text-[var(--ink-700)] ring-1 ring-[hsl(var(--border)/0.8)]">
            {liveJob.jobId}
          </code>
        </div>
        <div className="rounded-3xl bg-[linear-gradient(180deg,hsl(var(--surface)/0.88),hsl(var(--surface-hover)/0.92))] p-4">
          <div className="mb-3 flex items-center gap-3 text-sm text-[var(--ink-700)]">
            {liveJob.status === 'PROCESSING' ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            {liveJob.message}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--card)/0.9)]">
            <div
              className="after:animate-shimmer-sweep relative h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)))] transition-[width] duration-500 after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.6),transparent)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 text-sm text-[var(--ink-700)] sm:grid-cols-3">
            <p>
              <span className="font-medium text-[var(--ink-900)]">Collected:</span>{' '}
              {liveJob.collectedProviders.toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-[var(--ink-900)]">Remaining:</span>{' '}
              {liveJob.estimatedRemainingProviders.toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-[var(--ink-900)]">Expected total:</span>{' '}
              {liveJob.totalProvidersFound.toLocaleString()}
            </p>
          </div>
          {liveJob.outputFileName ? (
            <p className="mt-3 text-sm text-[var(--ink-700)]">
              Export file:{' '}
              <span className="font-medium text-[var(--ink-900)]">{liveJob.outputFileName}</span>
            </p>
          ) : null}
          {liveJob.error ? (
            <p className="mt-3 text-sm text-[var(--warning-700)]">
              Failure details: {liveJob.error}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
