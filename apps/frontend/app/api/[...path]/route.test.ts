import { ApiErrorCode } from '@npi/contracts'
import type { NextRequest } from 'next/server'
import { POST } from './route'

interface MockRouteRequestOptions {
  body?: string
  headers?: Record<string, string>
  method?: string
  search?: string
}

function createMockRouteRequest(options: MockRouteRequestOptions = {}): NextRequest {
  const {
    body = '{}',
    headers = { 'content-type': 'application/json' },
    method = 'POST',
    search = '',
  } = options

  const requestLike = {
    method,
    headers: new Headers(headers),
    nextUrl: new URL(`http://localhost/api/providers/bulk${search}`),
    arrayBuffer: () => Promise.resolve(new TextEncoder().encode(body).buffer),
  }

  return requestLike as unknown as NextRequest
}

describe('api catch-all proxy route', () => {
  const mockFetch = jest.spyOn(global, 'fetch')

  afterEach(() => {
    mockFetch.mockReset()
  })

  it('removes stale transport headers from upstream response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ jobId: 'job-123' }), {
        status: 202,
        headers: {
          'content-type': 'application/json',
          'content-encoding': 'gzip',
          'content-length': '999',
          'transfer-encoding': 'chunked',
          'x-upstream': 'nppes-api',
        },
      }),
    )

    const response = await POST(createMockRouteRequest(), {
      params: Promise.resolve({ path: ['providers', 'bulk'] }),
    })

    await expect(response.json()).resolves.toEqual({ jobId: 'job-123' })
    expect(response.status).toBe(202)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('x-upstream')).toBe('nppes-api')
    expect(response.headers.get('content-encoding')).toBeNull()
    expect(response.headers.get('content-length')).toBeNull()
    expect(response.headers.get('transfer-encoding')).toBeNull()
  })

  it('returns a standardized 503 payload when upstream is unavailable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('connection reset'))

    const response = await POST(createMockRouteRequest({ search: '?state=TX' }), {
      params: Promise.resolve({ path: ['providers', 'bulk'] }),
    })

    expect(response.status).toBe(503)

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        code: ApiErrorCode.NppesUnavailable,
        message: 'The API service is unavailable. Please try again in a moment.',
      }),
    )
  })
})
