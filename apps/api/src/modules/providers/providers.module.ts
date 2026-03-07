import { Module } from '@nestjs/common'
import { NppesClientModule } from '../nppes-client/nppes-client.module'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'

@Module({
  imports: [NppesClientModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
