import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const apiBaseUrl = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

interface ProbeResult {
  endpoint: string
  status: number
  durationMs: number
  ok: boolean
}

const warmupProbes = [
  { endpoint: '/api/health', method: 'GET' as const, body: undefined },
  {
    endpoint: '/api/providers/search',
    method: 'POST' as const,
    body: { state: 'WY', limit: 5 },
  },
  {
    endpoint: '/api/statistics',
    method: 'POST' as const,
    body: { state: 'WY' },
  },
  {
    endpoint: '/api/providers/search',
    method: 'POST' as const,
    body: { npi: '1234567893' },
  },
] as const

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function executeProbe(probe: (typeof warmupProbes)[number]): Promise<ProbeResult> {
  const url = `${apiBaseUrl}${probe.endpoint}`
  const start = performance.now()

  try {
    const init: RequestInit = {
      method: probe.method,
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }

    if (probe.body !== undefined) {
      init.body = JSON.stringify(probe.body)
    }

    const response = await fetch(url, init)
    const durationMs = Math.round(performance.now() - start)

    return {
      endpoint: probe.endpoint,
      status: response.status,
      durationMs,
      ok: response.ok,
    }
  } catch {
    const durationMs = Math.round(performance.now() - start)

    return {
      endpoint: probe.endpoint,
      status: 0,
      durationMs,
      ok: false,
    }
  }
}

export async function GET(): Promise<Response> {
  const startTime = performance.now()
  const results: ProbeResult[] = []

  for (const probe of warmupProbes) {
    const result = await executeProbe(probe)
    results.push(result)

    // Jittered delay between probes (200–800ms) to look like organic traffic
    await sleep(randomInt(200, 800))
  }

  const totalMs = Math.round(performance.now() - startTime)
  const allOk = results.every((r) => r.ok)

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    totalMs,
    probes: results,
  })
}
