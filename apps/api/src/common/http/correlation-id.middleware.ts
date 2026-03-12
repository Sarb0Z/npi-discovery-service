import { Injectable, Logger, type NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export const CORRELATION_ID_HEADER = 'x-correlation-id'

type RequestWithCorrelationId = Request & {
  correlationId?: string
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name)

  use(request: Request, response: Response, next: NextFunction): void {
    const requestWithCorrelationId = request as RequestWithCorrelationId
    const headerValue = request.headers[CORRELATION_ID_HEADER]
    const correlationId =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue)?.trim() ?? randomUUID()
    const startedAt = Date.now()

    requestWithCorrelationId.correlationId = correlationId
    response.setHeader(CORRELATION_ID_HEADER, correlationId)

    response.on('finish', () => {
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} correlationId=${correlationId} durationMs=${Date.now() - startedAt}`,
      )
    })

    next()
  }
}
