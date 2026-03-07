import 'reflect-metadata'

describe('main bootstrap', () => {
  const createDocumentMock = jest.fn()
  const setupMock = jest.fn()
  const decoratorFactoryMock = jest.fn(() => () => undefined)
  const setTitleMock = jest.fn()
  const setDescriptionMock = jest.fn()
  const setVersionMock = jest.fn()
  const buildMock = jest.fn()
  const createMock = jest.fn()

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    setTitleMock.mockReturnValue({
      setDescription: setDescriptionMock,
    })
    setDescriptionMock.mockReturnValue({
      setVersion: setVersionMock,
    })
    setVersionMock.mockReturnValue({
      build: buildMock,
    })
    buildMock.mockReturnValue({ openapi: '3.0.0' })
  })

  it('bootstraps Nest with validation, filters, swagger, and listening port', async () => {
    const app = {
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }
    createMock.mockResolvedValue(app)
    createDocumentMock.mockReturnValue({ paths: {} })

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }))
    jest.doMock('@nestjs/swagger', () => ({
      ApiAcceptedResponse: decoratorFactoryMock,
      ApiBody: decoratorFactoryMock,
      ApiOkResponse: decoratorFactoryMock,
      ApiOperation: decoratorFactoryMock,
      ApiPropertyOptional: decoratorFactoryMock,
      ApiTags: decoratorFactoryMock,
      DocumentBuilder: jest.fn().mockImplementation(() => ({
        setTitle: setTitleMock,
      })),
      SwaggerModule: {
        createDocument: createDocumentMock,
        setup: setupMock,
      },
    }))
    jest.doMock('./app.module', () => ({
      AppModule: class AppModule {},
    }))

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, import/no-dynamic-require, global-require
      require('./main')
    })

    await Promise.resolve()
    await Promise.resolve()

    expect(createMock).toHaveBeenCalledTimes(1)
    expect(app.enableCors).toHaveBeenCalledTimes(1)
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api')
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1)
    expect(app.useGlobalFilters).toHaveBeenCalledTimes(1)
    expect(createDocumentMock).toHaveBeenCalledWith(app, { openapi: '3.0.0' })
    expect(setupMock).toHaveBeenCalledWith('api/docs', app, { paths: {} })
    expect(app.listen).toHaveBeenCalledWith(3000)
  })
})
