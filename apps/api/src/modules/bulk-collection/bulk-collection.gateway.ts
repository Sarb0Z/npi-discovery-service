import { Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { BulkJobProgressDto } from '@npi/contracts'
import type { Server, Socket } from 'socket.io'
import { RedisService } from '../../common/redis/redis.service'

export const BULK_JOB_NAMESPACE = 'bulk-jobs'
export const BULK_JOB_PROGRESS_EVENT = 'bulk-job:progress'
export const BULK_JOB_SUBSCRIBE_EVENT = 'bulk-job:subscribe'
const BULK_JOB_PROGRESS_CHANNEL = 'bulk-job-progress'

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: BULK_JOB_NAMESPACE,
})
export class BulkCollectionGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BulkCollectionGateway.name)
  private unsubscribeFromRedis?: () => Promise<void>

  constructor(private readonly redisService: RedisService) {}

  @WebSocketServer()
  server?: Server

  async onModuleInit(): Promise<void> {
    this.unsubscribeFromRedis = await this.redisService.subscribe(
      BULK_JOB_PROGRESS_CHANNEL,
      (message) => {
        try {
          const progress = JSON.parse(message) as BulkJobProgressDto
          this.emitProgress(progress)
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'Unknown progress payload error'
          this.logger.warn(`Ignoring malformed bulk progress payload: ${detail}`)
        }
      },
    )
  }

  async onModuleDestroy(): Promise<void> {
    await this.unsubscribeFromRedis?.()
  }

  handleConnection(client: Socket): void {
    const jobId = this.extractJobId(client)

    if (!jobId) {
      return
    }

    void client.join(jobId)
    this.logger.debug(`Bulk websocket client subscribed on connect for job ${jobId}`)
  }

  @SubscribeMessage(BULK_JOB_SUBSCRIBE_EVENT)
  handleSubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { jobId?: string },
  ): void {
    const jobId = typeof body.jobId === 'string' ? body.jobId.trim() : ''

    if (!jobId) {
      return
    }

    void client.join(jobId)
    this.logger.debug(`Bulk websocket client subscribed explicitly for job ${jobId}`)
  }

  publishProgress(progress: BulkJobProgressDto): void {
    if (this.redisService.isEnabled()) {
      void this.redisService.publishJson(BULK_JOB_PROGRESS_CHANNEL, progress).catch((error) => {
        const detail = error instanceof Error ? error.message : 'Unknown Redis publish failure'
        this.logger.warn(`Redis bulk progress publish failed, emitting locally: ${detail}`)
        this.emitProgress(progress)
      })
      return
    }

    this.emitProgress(progress)
  }

  private extractJobId(client: Socket): string | null {
    const auth = client.handshake.auth as { jobId?: unknown } | undefined
    const authJobId = auth?.jobId

    if (typeof authJobId === 'string' && authJobId.trim().length > 0) {
      return authJobId.trim()
    }

    const query = client.handshake.query as { jobId?: unknown }
    const queryJobId = query.jobId

    if (typeof queryJobId === 'string' && queryJobId.trim().length > 0) {
      return queryJobId.trim()
    }

    return null
  }

  private emitProgress(progress: BulkJobProgressDto): void {
    this.server?.to(progress.jobId).emit(BULK_JOB_PROGRESS_EVENT, progress)
  }
}
