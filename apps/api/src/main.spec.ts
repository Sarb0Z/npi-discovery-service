import 'reflect-metadata'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { OpenAPIObject } from '@nestjs/swagger'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'
import { bootstrap } from './main'

describe('main bootstrap', () => {
  const createDocumentMock = jest.spyOn(SwaggerModule, 'createDocument')
  const setupMock = jest.spyOn(SwaggerModule, 'setup')
  const setTitleMock = jest.spyOn(DocumentBuilder.prototype, 'setTitle')
  const setDescriptionMock = jest.spyOn(DocumentBuilder.prototype, 'setDescription')
  const setVersionMock = jest.spyOn(DocumentBuilder.prototype, 'setVersion')
  const buildMock = jest.spyOn(DocumentBuilder.prototype, 'build')
  const createMock = jest.spyOn(NestFactory, 'create')

  beforeEach(() => {
    jest.clearAllMocks()

    setTitleMock.mockReturnThis()
    setDescriptionMock.mockReturnThis()
    setVersionMock.mockReturnThis()
    buildMock.mockReturnValue({
      openapi: '3.0.0',
      info: {
        title: 'Healthcare Provider Discovery Service',
        version: '1.0.0',
      },
    })
    setupMock.mockImplementation(() => undefined)
  })

  it('bootstraps Nest with validation, filters, swagger, and listening port', async () => {
    const swaggerConfig = {
      openapi: '3.0.0',
      info: {
        title: 'Healthcare Provider Discovery Service',
        version: '1.0.0',
      },
    }
    const swaggerDocument: OpenAPIObject = {
      ...swaggerConfig,
      paths: {},
    }
    const app = {
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }
    createMock.mockResolvedValue(app as never)
    createDocumentMock.mockReturnValue(swaggerDocument)

    await bootstrap()

    expect(createMock).toHaveBeenCalledTimes(1)
    expect(createMock).toHaveBeenCalledWith(AppModule)
    expect(app.enableCors).toHaveBeenCalledTimes(1)
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api')
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1)
    const [validationPipe] = app.useGlobalPipes.mock.calls[0] as [ValidationPipe]
    expect(validationPipe).toBeInstanceOf(ValidationPipe)
    expect(app.useGlobalFilters).toHaveBeenCalledTimes(1)
    const [exceptionFilter] = app.useGlobalFilters.mock.calls[0] as [ApiExceptionFilter]
    expect(exceptionFilter).toBeInstanceOf(ApiExceptionFilter)
    expect(createDocumentMock).toHaveBeenCalledWith(app, swaggerConfig)
    expect(setupMock).toHaveBeenCalledWith('api/docs', app, swaggerDocument)
    expect(app.listen).toHaveBeenCalledWith(3000, '0.0.0.0')
  })
})
