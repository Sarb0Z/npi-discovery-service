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
  status: 'PROCESSING'
  message: string
}
