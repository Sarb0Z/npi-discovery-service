import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { ApiErrorCode } from '@npi/contracts'
import { getErrorCodeForStatus } from '../errors/api-error.util'

interface ExceptionResponseShape {
  code?: ApiErrorCode
  message?: string | string[]
}

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    const payload = this.normalizePayload(status, exception, exceptionResponse)

    response.status(status).json({
      ...payload,
      timestamp: new Date().toISOString(),
    })
  }

  private normalizePayload(
    status: number,
    exception: HttpException,
    exceptionResponse: string | object,
  ): { code: ApiErrorCode; message: string; details?: string[] } {
    if (exception instanceof BadRequestException) {
      const badRequestPayload = exceptionResponse as ExceptionResponseShape
      const details = Array.isArray(badRequestPayload.message)
        ? badRequestPayload.message
        : undefined

      return {
        code: ApiErrorCode.ValidationError,
        message: 'Validation failed',
        details,
      }
    }

    if (typeof exceptionResponse === 'string') {
      return {
        code: getErrorCodeForStatus(status),
        message: exceptionResponse,
      }
    }

    const payload = exceptionResponse as ExceptionResponseShape

    return {
      code: payload.code ?? getErrorCodeForStatus(status),
      message: Array.isArray(payload.message)
        ? payload.message.join(', ')
        : (payload.message ?? exception.message ?? HttpStatus[status]),
    }
  }
}
