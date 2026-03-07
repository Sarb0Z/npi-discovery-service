import { Module } from '@nestjs/common'
import { ProvidersModule } from '../providers/providers.module'
import { BulkCollectionController } from './bulk-collection.controller'
import { BulkCollectionService } from './bulk-collection.service'

@Module({
  imports: [ProvidersModule],
  controllers: [BulkCollectionController],
  providers: [BulkCollectionService],
})
export class BulkCollectionModule {}