import 'reflect-metadata'

import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  BulkCollectionDto,
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

  it('rejects an invalid state code', async () => {
    const dto = plainToInstance(SearchProvidersDto, { city: 'Austin', state: 'Texas' })
    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts omitted optional fields when pagination defaults are provided', async () => {
    const dto = plainToInstance(SearchProvidersDto, { page: 1, limit: 50, zipCode: '75201' })
    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })
})

describe('BulkCollectionDto', () => {
  it('enforces batch size bounds', async () => {
    const tooSmall = plainToInstance(BulkCollectionDto, {
      zipCode: '75201',
      page: 1,
      limit: 50,
      batchSize: 25,
    })
    const tooLarge = plainToInstance(BulkCollectionDto, {
      zipCode: '75201',
      page: 1,
      limit: 50,
      batchSize: 500,
    })

    const [smallErrors, largeErrors] = await Promise.all([validate(tooSmall), validate(tooLarge)])

    expect(smallErrors.length).toBeGreaterThan(0)
    expect(largeErrors.length).toBeGreaterThan(0)
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
