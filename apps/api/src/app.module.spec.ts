import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { APP_GUARD } from '@nestjs/core'
import { BulkCollectionModule } from './modules/bulk-collection/bulk-collection.module'
import { NppesClientModule } from './modules/nppes-client/nppes-client.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { StatisticsModule } from './modules/statistics/statistics.module'
import { AppModule } from './app.module'
import { AppController } from './app.controller'
import { RedisModule } from './common/redis/redis.module'

describe('AppModule', () => {
  it('registers infrastructure, feature modules, and the health controller', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[]
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AppModule) as unknown[]
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule) as {
      provide?: unknown
      useClass?: unknown
    }[]

    expect(imports).toEqual(
      expect.arrayContaining([
        RedisModule,
        NppesClientModule,
        ProvidersModule,
        StatisticsModule,
        BulkCollectionModule,
      ]),
    )
    expect(controllers).toEqual([AppController])
    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provide: APP_GUARD,
        }),
      ]),
    )
  })
})
