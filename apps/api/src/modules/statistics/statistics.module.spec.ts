import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { ProvidersModule } from '../providers/providers.module'
import { StatisticsController } from './statistics.controller'
import { StatisticsModule } from './statistics.module'
import { StatisticsService } from './statistics.service'

describe('StatisticsModule', () => {
  it('wires the statistics controller and service', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, StatisticsModule) as unknown[]
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      StatisticsModule,
    ) as unknown[]
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, StatisticsModule) as unknown[]

    expect(imports).toEqual([ProvidersModule])
    expect(controllers).toEqual([StatisticsController])
    expect(providers).toEqual([StatisticsService])
  })
})
