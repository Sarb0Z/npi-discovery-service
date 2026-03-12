'use client'

import type { ProviderDto } from '@npi/contracts'
import type { CircleMarker, LayerGroup, Map as LeafletMap } from 'leaflet'
import { MapPinned } from 'lucide-react'
import * as zipcodes from 'zipcodes'
import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProviderMapProps {
  providers: ProviderDto[]
}

interface ProviderMapPoint {
  key: string
  zipCode: string
  city: string
  state: string
  latitude: number
  longitude: number
  providers: ProviderDto[]
}

export function ProviderMap({ providers }: ProviderMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layerRef = useRef<LayerGroup | null>(null)

  const points = useMemo(() => buildMapPoints(providers), [providers])
  const mappedProviderCount = useMemo(
    () => points.reduce((total, point) => total + point.providers.length, 0),
    [points],
  )
  const unresolvedProviderCount = providers.length - mappedProviderCount

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let cancelled = false

    void (async () => {
      const leaflet = await import('leaflet')

      if (cancelled) {
        return
      }

      if (!mapRef.current) {
        const map = leaflet.map(container, {
          zoomControl: false,
          scrollWheelZoom: false,
        })

        leaflet.control.zoom({ position: 'bottomright' }).addTo(map)
        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18,
          })
          .addTo(map)

        mapRef.current = map
      }

      const map = mapRef.current

      if (!map) {
        return
      }

      layerRef.current?.remove()
      layerRef.current = null

      if (points.length === 0) {
        map.setView([39.8283, -98.5795], 4)
        return
      }

      const layerGroup = leaflet.layerGroup()
      const bounds = leaflet.latLngBounds([])

      for (const point of points) {
        const marker: CircleMarker = leaflet.circleMarker([point.latitude, point.longitude], {
          color: '#1d4ed8',
          fillColor: '#10b981',
          fillOpacity: 0.78,
          radius: Math.min(18, 8 + Math.log2(point.providers.length + 1) * 3),
          weight: 2,
        })

        marker.bindPopup(buildPopupHtml(point), { maxWidth: 320 })
        marker.addTo(layerGroup)
        bounds.extend([point.latitude, point.longitude])
      }

      layerGroup.addTo(map)
      layerRef.current = layerGroup

      if (points.length === 1) {
        const [point] = points

        if (point) {
          map.setView([point.latitude, point.longitude], 9)
        }
      } else {
        map.fitBounds(bounds.pad(0.22))
      }

      window.requestAnimationFrame(() => {
        map.invalidateSize()
      })
    })()

    return () => {
      cancelled = true
    }
  }, [points])

  useEffect(() => {
    return () => {
      layerRef.current?.remove()
      mapRef.current?.remove()
      layerRef.current = null
      mapRef.current = null
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--secondary)/0.18))] text-[var(--brand-700)]">
            <MapPinned className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Provider footprint map</CardTitle>
            <CardDescription>
              Markers are plotted from ZIP-code centroids so broad result sets stay fast and fully
              client-side.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--ink-600)]">
          <p>{points.length.toLocaleString()} mapped areas</p>
          <p>{mappedProviderCount.toLocaleString()} providers positioned</p>
          {unresolvedProviderCount > 0 ? (
            <p>{unresolvedProviderCount.toLocaleString()} providers without mappable ZIP data</p>
          ) : null}
        </div>
        {points.length > 0 ? (
          <div
            ref={containerRef}
            aria-label="Provider footprint map"
            className="provider-map h-[420px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[hsl(var(--card)/0.8)] shadow-[var(--shadow-sm)]"
          />
        ) : (
          <div className="rounded-[28px] border border-dashed border-[var(--line)] bg-[var(--surface-100)] px-6 py-10 text-sm text-[var(--ink-600)]">
            No providers in the current result set have enough postal-code data to render on the
            map.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function buildMapPoints(providers: ProviderDto[]): ProviderMapPoint[] {
  const groupedPoints = new Map<string, ProviderMapPoint>()

  for (const provider of providers) {
    const zipCode = extractZipCode(provider.address.zipCode)

    if (!zipCode) {
      continue
    }

    const location = zipcodes.lookup(zipCode)

    if (!location) {
      continue
    }

    const existingPoint = groupedPoints.get(zipCode)

    if (existingPoint) {
      existingPoint.providers.push(provider)
      continue
    }

    groupedPoints.set(zipCode, {
      key: zipCode,
      zipCode,
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      providers: [provider],
    })
  }

  return Array.from(groupedPoints.values()).sort(
    (left, right) => right.providers.length - left.providers.length,
  )
}

function extractZipCode(value: string): string | null {
  const match = /^(\d{5})/.exec(value)

  return match?.[1] ?? null
}

function buildPopupHtml(point: ProviderMapPoint): string {
  const sampleNames = point.providers
    .slice(0, 3)
    .map((provider) => `<li>${escapeHtml(provider.name)}</li>`)
    .join('')

  const remainingCount = point.providers.length - 3

  return [
    '<div class="provider-map-popup">',
    `<strong>${escapeHtml(point.city)}, ${escapeHtml(point.state)} ${escapeHtml(point.zipCode)}</strong>`,
    `<p>${point.providers.length.toLocaleString()} provider${point.providers.length === 1 ? '' : 's'}</p>`,
    sampleNames ? `<ul>${sampleNames}</ul>` : '',
    remainingCount > 0 ? `<p>+${remainingCount.toLocaleString()} more</p>` : '',
    '</div>',
  ].join('')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}