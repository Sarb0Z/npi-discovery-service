import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { BulkCollectionModule } from './modules/bulk-collection/bulk-collection.module'
import { NppesClientModule } from './modules/nppes-client/nppes-client.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { StatisticsModule } from './modules/statistics/statistics.module'

@Module({
  imports: [NppesClientModule, ProvidersModule, StatisticsModule, BulkCollectionModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
