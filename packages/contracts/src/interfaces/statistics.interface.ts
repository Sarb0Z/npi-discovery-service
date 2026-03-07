export interface StatisticsSummary {
  totalProviders: number
  individualCount: number
  organizationCount: number
  multipleTaxonomiesCount: number
  uniqueCitiesCount: number
}

export interface ProviderTypeDistributionItem {
  name: string
  value: number
}

export interface TopSpecialtyItem {
  description: string
  count: number
  percentage: number
}

export interface TopCityItem {
  name: string
  count: number
}

export interface StatisticsResponseDto {
  summary: StatisticsSummary
  providerTypeDistribution: ProviderTypeDistributionItem[]
  topSpecialties: TopSpecialtyItem[]
  topCities: TopCityItem[]
}
