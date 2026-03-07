import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { ApiErrorCode } from '@npi/contracts'

export class NppesUnavailableException extends BadGatewayException {
  constructor(message = 'NPPES API is currently unavailable.') {
    super({
      code: ApiErrorCode.NppesUnavailable,
      message,
    })
  }
}

export class UpstreamRateLimitedException extends HttpException {
  constructor(message = 'NPPES API rate limit reached. Please retry shortly.') {
    super(
      {
        code: ApiErrorCode.RateLimited,
        message,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }
}

export class ProvidersNotFoundException extends NotFoundException {
  constructor(message = 'No providers matched the requested search criteria.') {
    super({
      code: ApiErrorCode.ProviderNotFound,
      message,
    })
  }
}