import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createIndividualProvider } from '../../../test/fixtures/provider.fixture'
import { createBulkCollectionDto } from '../../../test/fixtures/search-params.fixture'
import { ProvidersService } from '../providers/providers.service'
import { BulkCollectionService } from './bulk-collection.service'

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}))

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}))

describe('BulkCollectionService', () => {
  let service: BulkCollectionService
  let providersService: { search: jest.Mock }

  async function flushMicrotasks(): Promise<void> {
    await Promise.resolve()
    await Promise.resolve()
  }

  beforeEach(async () => {
    providersService = {
      search: jest.fn().mockResolvedValue({
        providers: [createIndividualProvider()],
        metadata: {
          totalCount: 1,
          searchParams: { zipCode: '75201' },
          timestamp: '2026-03-07T12:00:00.000Z',
          duration: 10,
          page: 1,
          limit: 50,
        },
      }),
    }
    ;(randomUUID as jest.Mock).mockReturnValue('job-123')

    const module = await Test.createTestingModule({
      providers: [
        BulkCollectionService,
        {
          provide: ProvidersService,
          useValue: providersService,
        },
      ],
    }).compile()

    service = module.get(BulkCollectionService)
    jest.clearAllMocks()
    ;(randomUUID as jest.Mock).mockReturnValue('job-123')
  })

  it('returns a processing job response immediately', async () => {
    const result = await service.startCollection(createBulkCollectionDto())

    expect(result).toEqual({
      jobId: 'job-123',
      status: 'PROCESSING',
      message:
        'Bulk collection initiated. Results will be saved to the configured output directory.',
    })
  })

  it('writes the collected results to disk asynchronously', async () => {
    await service.startCollection(createBulkCollectionDto({ taxonomyDescription: 'Dentist' }))
    await flushMicrotasks()

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true })
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('providers_75201_dentist_'),
      expect.stringContaining('"jobId": "job-123"'),
      'utf8',
    )
  })

  it('logs and swallows collection failures', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    providersService.search.mockRejectedValueOnce(new Error('boom'))

    await service.startCollection(createBulkCollectionDto())
    await flushMicrotasks()

    expect(loggerSpy).toHaveBeenCalledWith('Bulk collection job job-123 failed', expect.any(Error))
  })

  it('includes serialized search metadata in the exported payload', async () => {
    await service.startCollection(createBulkCollectionDto())
    await flushMicrotasks()

    expect(writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"metadata": {'),
      'utf8',
    )
  })
})
