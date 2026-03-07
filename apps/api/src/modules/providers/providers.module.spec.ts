import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { NppesClientModule } from '../nppes-client/nppes-client.module'
import { ProviderSearchCollectorService } from './provider-search-collector.service'
import { ProvidersController } from './providers.controller'
import { ProvidersModule } from './providers.module'
import { ProvidersService } from './providers.service'

describe('ProvidersModule', () => {
  it('wires the providers controller and service', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, ProvidersModule) as unknown[]
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      ProvidersModule,
    ) as unknown[]
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ProvidersModule) as unknown[]
    const exportsMetadata = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      ProvidersModule,
    ) as unknown[]

    expect(imports).toEqual([NppesClientModule])
    expect(controllers).toEqual([ProvidersController])
    expect(providers).toEqual([ProvidersService, ProviderSearchCollectorService])
    expect(exportsMetadata).toEqual([ProvidersService, ProviderSearchCollectorService])
  })
})
