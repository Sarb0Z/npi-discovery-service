import { Logger } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { CORRELATION_ID_HEADER, CorrelationIdMiddleware } from './correlation-id.middleware'

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}))

const mockedRandomUuid = jest.mocked(randomUUID)

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware()
    jest.clearAllMocks()
  })

  it('reuses incoming correlation id and logs on response finish', () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    const next = jest.fn() as unknown as NextFunction
    const request = {
      method: 'GET',
      originalUrl: '/api/providers',
      headers: {
        [CORRELATION_ID_HEADER]: '  incoming-correlation-id  ',
      },
    } as unknown as Request

    let finishHandler: (() => void) | undefined

    const setHeader = jest.fn()
    const on = jest.fn((event: string, handler: () => void) => {
      if (event === 'finish') {
        finishHandler = handler
      }
    })
    const response = {
      statusCode: 200,
      setHeader,
      on,
    } as unknown as Response

    middleware.use(request, response, next)

    expect((request as Request & { correlationId?: string }).correlationId).toBe(
      'incoming-correlation-id',
    )
    expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, 'incoming-correlation-id')
    expect(next).toHaveBeenCalledTimes(1)

    finishHandler?.()

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/providers 200 correlationId=incoming-correlation-id'),
    )
  })

  it('generates a correlation id when header is missing', () => {
    mockedRandomUuid.mockReturnValue('11111111-1111-4111-8111-111111111111')
    const next = jest.fn() as unknown as NextFunction
    const request = {
      method: 'POST',
      originalUrl: '/api/providers/search',
      headers: {},
    } as unknown as Request

    const setHeader = jest.fn()
    const response = {
      statusCode: 201,
      setHeader,
      on: jest.fn(),
    } as unknown as Response

    middleware.use(request, response, next)

    expect(mockedRandomUuid).toHaveBeenCalledTimes(1)
    expect((request as Request & { correlationId?: string }).correlationId).toBe(
      '11111111-1111-4111-8111-111111111111',
    )
    expect(setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      '11111111-1111-4111-8111-111111111111',
    )
    expect(next).toHaveBeenCalledTimes(1)
  })
})
