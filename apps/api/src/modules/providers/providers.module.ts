import { Module } from '@nestjs/common'
import { NppesClientModule } from '../nppes-client/nppes-client.module'
import { ProvidersController } from './providers.controller'
import { ProviderSearchCollectorService } from './provider-search-collector.service'
import { ProvidersService } from './providers.service'

@Module({
  imports: [NppesClientModule],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProviderSearchCollectorService],
  exports: [ProvidersService, ProviderSearchCollectorService],
})
export class ProvidersModule {}
