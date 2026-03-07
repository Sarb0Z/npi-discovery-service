import { Injectable } from '@nestjs/common'
import {
  ProviderType,
  type ProviderDto,
  type SearchProvidersDto,
  type StatisticsResponseDto,
} from '@npi/contracts'
import { ProvidersService } from '../providers/providers.service'

@Injectable()
export class StatisticsService {
  constructor(private readonly providersService: ProvidersService) {}

  async getStatistics(searchDto: SearchProvidersDto): Promise<StatisticsResponseDto> {
    const searchResponse = await this.providersService.search(searchDto)
    const providers = searchResponse.providers
    const individualCount = providers.filter(
      (provider) => provider.type === ProviderType.Individual,
    ).length
    const organizationCount = providers.filter(
      (provider) => provider.type === ProviderType.Organization,
    ).length
    const multipleTaxonomiesCount = providers.filter(
      (provider) => provider.specialties.length > 1,
    ).length
    const uniqueCitiesCount = new Set(
      providers.map((provider) => provider.address.city).filter((city) => city.length > 0),
    ).size

    return {
      summary: {
        totalProviders: providers.length,
        individualCount,
        organizationCount,
        multipleTaxonomiesCount,
        uniqueCitiesCount,
      },
      providerTypeDistribution: [
        { name: 'Individual', value: individualCount },
        { name: 'Organization', value: organizationCount },
      ],
      topSpecialties: buildTopSpecialties(providers),
      topCities: buildTopCities(providers),
      taxonomyBreakdown: buildTaxonomyBreakdown(providers),
    }
  }
}

function buildTopSpecialties(providers: ProviderDto[]): StatisticsResponseDto['topSpecialties'] {
  const totalProviders = providers.length || 1
  const specialtyCounts = new Map<string, number>()

  for (const provider of providers) {
    const specialty = provider.primarySpecialty
    specialtyCounts.set(specialty, (specialtyCounts.get(specialty) ?? 0) + 1)
  }

  return Array.from(specialtyCounts.entries())
    .map(([description, count]) => ({
      description,
      count,
      percentage: Number(((count / totalProviders) * 100).toFixed(2)),
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 10)
}

function buildTopCities(providers: ProviderDto[]): StatisticsResponseDto['topCities'] {
  const cityCounts = new Map<string, number>()

  for (const provider of providers) {
    const city = provider.address.city

    if (!city) {
      continue
    }

    cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1)
  }

  return Array.from(cityCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 10)
}

function buildTaxonomyBreakdown(
  providers: ProviderDto[],
): StatisticsResponseDto['taxonomyBreakdown'] {
  const totalProviders = providers.length || 1
  const taxonomyCounts = new Map<string, { code: string; description: string; count: number }>()

  for (const provider of providers) {
    for (const taxonomy of provider.taxonomies) {
      const code = taxonomy.code || 'UNKNOWN'
      const description = taxonomy.description || provider.primarySpecialty
      const key = `${code}:${description}`
      const current = taxonomyCounts.get(key)

      if (current) {
        current.count += 1
        continue
      }

      taxonomyCounts.set(key, {
        code,
        description,
        count: 1,
      })
    }
  }

  return Array.from(taxonomyCounts.values())
    .map((item) => ({
      ...item,
      percentage: Number(((item.count / totalProviders) * 100).toFixed(2)),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count
      }

      return left.description.localeCompare(right.description)
    })
}
