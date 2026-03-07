import type { SearchResponseDto, StatisticsResponseDto } from '@npi/contracts'
import { http, HttpResponse } from 'msw'

const searchResponse: SearchResponseDto = {
  providers: [
    {
      npi: '1234567890',
      type: 1,
      name: 'Dr. Jane Smith',
      primarySpecialty: 'Dentist',
      specialties: ['Dentist'],
      address: {
        address1: '100 Main St',
        address2: null,
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      phone: '512-555-0199',
    },
  ],
  metadata: {
    totalCount: 1,
    searchParams: { zipCode: '78701' },
    timestamp: new Date().toISOString(),
    duration: 120,
    page: 1,
    limit: 50,
    upstreamLimitUsed: 50,
    partitioned: false,
    partitionCount: 1,
    complete: true,
    overflowedPartitionCount: 0,
    estimatedRemainingProviders: 0,
  },
}

const statisticsResponse: StatisticsResponseDto = {
  summary: {
    totalProviders: 1,
    individualCount: 1,
    organizationCount: 0,
    multipleTaxonomiesCount: 0,
    uniqueCitiesCount: 1,
  },
  providerTypeDistribution: [{ name: 'Individual', value: 1 }],
  topSpecialties: [{ description: 'Dentist', count: 1, percentage: 100 }],
  topCities: [{ name: 'Austin', count: 1 }],
}

export const handlers = [
  http.post('/api/providers/search', () => HttpResponse.json(searchResponse)),
  http.post('/api/statistics', () => HttpResponse.json(statisticsResponse)),
  http.post('/api/providers/bulk', () =>
    HttpResponse.json({
      jobId: 'job-123',
      status: 'PROCESSING',
      message: 'Bulk collection initiated.',
    }),
  ),
]
