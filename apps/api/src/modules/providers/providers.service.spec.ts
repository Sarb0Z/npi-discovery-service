import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { createNppesResponse, createRawIndividualProvider, createRawOrganizationProvider } from '../../../test/fixtures/nppes-response.fixture'
import {
  createCityStateSearchDto,
  createStateTaxonomySearchDto,
  createZipSearchDto,
} from '../../../test/fixtures/search-params.fixture'
import { NppesClientService } from '../nppes-client/nppes-client.service'
import { ProvidersService } from './providers.service'

describe('ProvidersService', () => {
  let service: ProvidersService
  let nppesClientService: { searchProviders: jest.Mock }

  beforeEach(async () => {
    nppesClientService = {
      searchProviders: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: NppesClientService,
          useValue: nppesClientService,
        },
      ],
    }).compile()

    service = module.get(ProvidersService)
  })

  it('collects providers across paginated NPPES responses', async () => {
    nppesClientService.searchProviders
      .mockResolvedValueOnce(
        createNppesResponse(
          Array.from({ length: 50 }, (_, index) =>
            createRawIndividualProvider({ number: `${index}`.padStart(10, '0') }),
          ),
          60,
        ),
      )
      .mockResolvedValueOnce(
        createNppesResponse([
          createRawOrganizationProvider({ number: '9999999999' }),
          createRawOrganizationProvider({ number: '8888888888' }),
        ], 60),
      )

    const result = await service.search(createZipSearchDto({ limit: 50 }))

    expect(result.providers).toHaveLength(52)
    expect(nppesClientService.searchProviders).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ page: 2, limit: 50 }),
    )
  })

  it('stops collecting once the skip limit is reached', async () => {
    nppesClientService.searchProviders.mockResolvedValue(
      createNppesResponse(
        Array.from({ length: 200 }, (_, index) =>
          createRawIndividualProvider({ number: `${index}`.padStart(10, '0') }),
        ),
        5000,
      ),
    )

    await service.search(createZipSearchDto({ limit: 200 }))

    expect(nppesClientService.searchProviders).toHaveBeenCalledTimes(6)
    expect(nppesClientService.searchProviders).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 6, limit: 200 }),
    )
  })

  it('filters by primary taxonomy description', async () => {
    nppesClientService.searchProviders.mockResolvedValue(
      createNppesResponse([
        createRawIndividualProvider(),
        createRawOrganizationProvider(),
      ]),
    )

    const result = await service.search(
      createCityStateSearchDto({ taxonomyDescription: 'dentistry' }),
    )

    expect(result.providers).toHaveLength(1)
    expect(result.providers[0]?.primarySpecialty).toBe('General Practice Dentistry')
  })

  it('rejects a pure state-only search', async () => {
    await expect(
      service.search({ state: 'TX', page: 1, limit: 50 }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('allows state searches when taxonomy criteria are present', async () => {
    nppesClientService.searchProviders.mockResolvedValue(
      createNppesResponse([createRawIndividualProvider()]),
    )

    const result = await service.search(createStateTaxonomySearchDto())

    expect(result.providers).toHaveLength(1)
    expect(nppesClientService.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'TX', taxonomyDescription: 'Dentist' }),
    )
  })

  it('returns response metadata with normalized search params', async () => {
    nppesClientService.searchProviders.mockResolvedValue(
      createNppesResponse([createRawIndividualProvider()]),
    )

    const result = await service.search(createZipSearchDto({ limit: 25 }))

    expect(result.metadata).toEqual(
      expect.objectContaining({
        totalCount: 1,
        page: 1,
        limit: 25,
      }),
    )
    expect(result.metadata.searchParams.zipCode).toBe('75201')
    expect(result.metadata.timestamp).toEqual(expect.any(String))
    expect(result.metadata.duration).toEqual(expect.any(Number))
  })
})
