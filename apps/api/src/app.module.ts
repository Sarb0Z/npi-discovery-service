import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { CorrelationIdMiddleware } from './common/http/correlation-id.middleware'
import { RedisModule } from './common/redis/redis.module'
import { BulkCollectionModule } from './modules/bulk-collection/bulk-collection.module'
import { NppesClientModule } from './modules/nppes-client/nppes-client.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { StatisticsModule } from './modules/statistics/statistics.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS ?? 60_000),
        limit: Number(process.env.THROTTLE_LIMIT ?? 120),
      },
    ]),
    RedisModule,
    NppesClientModule,
    ProvidersModule,
    StatisticsModule,
    BulkCollectionModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    })
  }
}
