import { ProviderType, type ProviderDto } from '@npi/contracts'

function downloadBlob(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(href)
}

export function buildExportFileName(
  location: string,
  taxonomy?: string,
  extension = 'json',
): string {
  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const normalizedLocation = location.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(',', '')
  const normalizedTaxonomy = taxonomy
    ? taxonomy.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(',', '')
    : 'all-specialties'

  return `providers_${normalizedLocation}_${normalizedTaxonomy}_${timestamp}.${extension}`
}

export function downloadJson(payload: object, fileName: string): void {
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), fileName)
}

export function downloadCsv(providers: ProviderDto[], fileName: string): void {
  const header = ['Name', 'NPI', 'Type', 'Primary Specialty', 'City', 'State', 'Phone']
  const rows = providers.map((provider) => [
    provider.name,
    provider.npi,
    provider.type === ProviderType.Individual ? 'Individual' : 'Organization',
    provider.primarySpecialty,
    provider.address.city,
    provider.address.state,
    provider.phone ?? '',
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), fileName)
}
