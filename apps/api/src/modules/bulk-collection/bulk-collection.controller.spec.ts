import { Test } from '@nestjs/testing'
import { createBulkCollectionDto } from '../../../test/fixtures/search-params.fixture'
import { BulkCollectionController } from './bulk-collection.controller'
import { BulkCollectionService } from './bulk-collection.service'

describe('BulkCollectionController', () => {
  let controller: BulkCollectionController
  let bulkCollectionService: { startCollection: jest.Mock }

  beforeEach(async () => {
    bulkCollectionService = {
      startCollection: jest.fn(),
    }

    const module = await Test.createTestingModule({
      controllers: [BulkCollectionController],
      providers: [
        {
          provide: BulkCollectionService,
          useValue: bulkCollectionService,
        },
      ],
    }).compile()

    controller = module.get(BulkCollectionController)
  })

  it('returns the async bulk job response', async () => {
    bulkCollectionService.startCollection.mockResolvedValue({
      jobId: 'job-123',
      status: 'PROCESSING',
      message: 'Bulk collection initiated. Results will be saved to the configured output directory.',
    })

    await expect(controller.startCollection(createBulkCollectionDto())).resolves.toEqual(
      expect.objectContaining({ jobId: 'job-123' }),
    )
  })
})
