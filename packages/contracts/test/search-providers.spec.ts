import 'reflect-metadata'

import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  ProviderType,
  SearchProvidersDto,
  buildNppesSearchParams,
  buildProviderExportFileName,
  clampBatchSize,
} from '../src'

describe('SearchProvidersDto', () => {
  it('accepts a valid zip search', async () => {
    const dto = plainToInstance(SearchProvidersDto, { zipCode: '75201', limit: 25 })
    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })

  it('rejects an invalid zip code', async () => {
    const dto = plainToInstance(SearchProvidersDto, { zipCode: '75A01' })
    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects city without state', async () => {
    const dto = plainToInstance(SearchProvidersDto, { city: 'Austin' })
    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts state-only searches for downstream partitioning', async () => {
    const dto = plainToInstance(SearchProvidersDto, { state: 'TX' })
    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })
})

describe('search utilities', () => {
  it('builds NPPES params with provider type conversion and clamped limit', () => {
    const params = buildNppesSearchParams({
      zipCode: '75201',
      providerType: ProviderType.Individual,
      page: 2,
      limit: 999,
    })

    expect(params.postal_code).toBe('75201')
    expect(params.enumeration_type).toBe('NPI-1')
    expect(params.limit).toBe(200)
    expect(params.skip).toBe(200)
  })

  it('builds export filenames with sanitized location and taxonomy', () => {
    const fileName = buildProviderExportFileName(
      {
        city: 'Austin',
        state: 'TX',
        taxonomyDescription: 'General Practice',
      },
      new Date('2026-03-07T12:34:56.000Z'),
    )

    expect(fileName).toBe('providers_austin_tx_general_practice_2026-03-07T12-34-56-000Z.json')
  })

  it('clamps batch sizes to the upstream range', () => {
    expect(clampBatchSize(25)).toBe(50)
    expect(clampBatchSize(300)).toBe(200)
  })
})
