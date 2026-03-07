import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ApiErrorCode } from '@npi/contracts'

const apiBaseUrl = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

interface ProxyRouteContext {
  params: Promise<{
    path: string[]
  }>
}

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)

  headers.delete('content-length')
  headers.delete('host')

  return headers
}

async function proxyRequest(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  const { path } = await context.params
  const upstreamPath = path.join('/')
  const upstreamUrl = new URL(`/api/${upstreamPath}${request.nextUrl.search}`, apiBaseUrl)
  const method = request.method.toUpperCase()

  const init: RequestInit = {
    method,
    headers: buildUpstreamHeaders(request),
    cache: 'no-store',
  }

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  try {
    const response = await fetch(upstreamUrl, init)

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch {
    return NextResponse.json(
      {
        code: ApiErrorCode.NppesUnavailable,
        message: 'The API service is unavailable. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
      },
    )
  }
}

export const runtime = 'nodejs'

export const DELETE = proxyRequest
export const GET = proxyRequest
export const HEAD = proxyRequest
export const OPTIONS = proxyRequest
export const PATCH = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
