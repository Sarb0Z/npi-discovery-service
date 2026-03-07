export type BulkJobStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface BulkCollectionMetadata {
  totalProvidersFound: number
  collectedProviders: number
  estimatedRemainingProviders: number
  partitioned: boolean
  partitionCount: number
  complete: boolean
  overflowedPartitionCount: number
  upstreamLimitUsed: number
  startedAt: string
  completedAt?: string
  durationMs?: number
}

export interface BulkJobResponseDto {
  jobId: string
  status: BulkJobStatus
  message: string
}

export interface BulkJobProgressDto {
  jobId: string
  status: BulkJobStatus
  message: string
  totalProvidersFound: number
  collectedProviders: number
  estimatedRemainingProviders: number
  outputFileName?: string
  completedAt?: string
  error?: string
}
