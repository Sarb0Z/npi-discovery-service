import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { BulkCollectionModule } from './modules/bulk-collection/bulk-collection.module'
import { NppesClientModule } from './modules/nppes-client/nppes-client.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { StatisticsModule } from './modules/statistics/statistics.module'
import { AppModule } from './app.module'
import { AppController } from './app.controller'

describe('AppModule', () => {
  it('registers all feature modules and the health controller', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[]
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AppModule) as unknown[]

    expect(imports).toEqual([
      NppesClientModule,
      ProvidersModule,
      StatisticsModule,
      BulkCollectionModule,
    ])
    expect(controllers).toEqual([AppController])
  })
})
