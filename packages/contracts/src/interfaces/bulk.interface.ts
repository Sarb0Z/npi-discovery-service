export interface BulkCollectionMetadata {
  totalProvidersFound: number
  collectedProviders: number
  remainingProviders: number
  startedAt: string
  completedAt?: string
  durationMs?: number
}

export interface BulkJobResponseDto {
  jobId: string
  status: 'PROCESSING'
  message: string
}