import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { NppesClientModule } from './nppes-client.module'
import { NppesClientService } from './nppes-client.service'

describe('NppesClientModule', () => {
  it('exports the NppesClientService', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, NppesClientModule) as unknown[]
    const exportsMetadata = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      NppesClientModule,
    ) as unknown[]

    expect(providers).toContain(NppesClientService)
    expect(exportsMetadata).toContain(NppesClientService)
  })
})
