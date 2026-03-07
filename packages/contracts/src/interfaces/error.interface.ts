import type { ApiErrorCode } from '../constants/provider.constants'

export interface ApiErrorResponse {
  code: ApiErrorCode
  message: string
  details?: string[]
  timestamp: string
}