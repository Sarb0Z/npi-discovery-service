import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { BulkJobProgressDto } from '@npi/contracts'
import type { Server, Socket } from 'socket.io'

export const BULK_JOB_NAMESPACE = 'bulk-jobs'
export const BULK_JOB_PROGRESS_EVENT = 'bulk-job:progress'
export const BULK_JOB_SUBSCRIBE_EVENT = 'bulk-job:subscribe'

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: BULK_JOB_NAMESPACE,
})
export class BulkCollectionGateway {
  private readonly logger = new Logger(BulkCollectionGateway.name)

  @WebSocketServer()
  server?: Server

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
    this.server?.to(progress.jobId).emit(BULK_JOB_PROGRESS_EVENT, progress)
  }

  private extractJobId(client: Socket): string | null {
    const authJobId = client.handshake.auth.jobId

    if (typeof authJobId === 'string' && authJobId.trim().length > 0) {
      return authJobId.trim()
    }

    const queryJobId = client.handshake.query.jobId

    if (typeof queryJobId === 'string' && queryJobId.trim().length > 0) {
      return queryJobId.trim()
    }

    return null
  }
}