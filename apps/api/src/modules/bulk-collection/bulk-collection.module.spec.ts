import 'reflect-metadata'

import { MODULE_METADATA } from '@nestjs/common/constants'
import { ProvidersModule } from '../providers/providers.module'
import { BulkCollectionController } from './bulk-collection.controller'
import { BulkCollectionModule } from './bulk-collection.module'
import { BulkCollectionService } from './bulk-collection.service'

describe('BulkCollectionModule', () => {
  it('wires the bulk collection controller and service', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, BulkCollectionModule) as unknown[]
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, BulkCollectionModule) as unknown[]
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, BulkCollectionModule) as unknown[]

    expect(imports).toEqual([ProvidersModule])
    expect(controllers).toEqual([BulkCollectionController])
    expect(providers).toEqual([BulkCollectionService])
  })
})