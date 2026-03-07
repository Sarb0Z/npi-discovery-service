import type { ProviderDto } from './provider.interface'

export interface SearchMetadata {
  totalCount: number
  searchParams: Record<string, string | number | undefined>
  timestamp: string
  duration: number
  page: number
  limit: number
}

export interface SearchResponseDto {
  providers: ProviderDto[]
  metadata: SearchMetadata
}