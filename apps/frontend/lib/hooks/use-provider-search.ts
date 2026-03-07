'use client'

import type { BulkJobResponseDto, SearchResponseDto, StatisticsResponseDto } from '@npi/contracts'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchStatistics, searchProviders, startBulkCollection } from '@/lib/api/providers'
import type { FrontendApiError } from '@/lib/api/providers'
import type { BulkFormValues, SearchFormValues } from '@/lib/schemas/search.schema'
import { useSearchStore } from '@/lib/stores/search-store'

function formatSearchLabel(values: SearchFormValues): string {
  if (values.zipCode) {
    return `ZIP ${values.zipCode}`
  }

  if (values.city && values.state) {
    return `${values.city}, ${values.state}`
  }

  return values.state ?? 'Search'
}

export function useProviderSearch() {
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch)

  return useMutation<SearchResponseDto, FrontendApiError, SearchFormValues>({
    mutationFn: searchProviders,
    onSuccess: (data, variables) => {
      toast.success(`Found ${data.metadata.totalCount.toLocaleString()} providers.`)
      addRecentSearch({
        label: formatSearchLabel(variables),
        query: new URLSearchParams(
          Object.entries({
            zipCode: variables.zipCode,
            city: variables.city,
            state: variables.state,
            taxonomyDescription: variables.taxonomyDescription,
            providerType: variables.providerType?.toString(),
          }).filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === 'string' && entry[1].length > 0,
          ),
        ).toString(),
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useStatistics(values: SearchFormValues | null) {
  return useQuery<StatisticsResponseDto, FrontendApiError>({
    queryKey: ['statistics', values],
    queryFn: async () => {
      if (!values) {
        throw new Error('Search parameters are required.')
      }

      return fetchStatistics(values)
    },
    enabled: values !== null,
  })
}

export function useBulkCollection() {
  return useMutation<BulkJobResponseDto, FrontendApiError, BulkFormValues>({
    mutationFn: startBulkCollection,
    onSuccess: (data) => {
      toast.success(`Bulk collection started: ${data.jobId}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
