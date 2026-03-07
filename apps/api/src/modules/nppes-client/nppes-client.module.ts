import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { NppesClientService } from './nppes-client.service'

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://npiregistry.cms.hhs.gov/api/',
      timeout: 15000,
    }),
  ],
  providers: [NppesClientService],
  exports: [NppesClientService],
})
export class NppesClientModule {}
