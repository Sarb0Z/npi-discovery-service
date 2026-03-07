import { HttpService } from '@nestjs/axios'
import type { Provider, Type } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

export interface HttpServiceMock {
  get: jest.Mock
  axiosRef: {
    defaults: Record<string, unknown>
  }
}

export function createHttpServiceMock(): HttpServiceMock {
  return {
    get: jest.fn(),
    axiosRef: {
      defaults: {},
    },
  }
}

export async function createTestingModuleWithMocks(options: {
  controllers?: Type<unknown>[]
  providers?: Provider[]
}): Promise<{ module: TestingModule; httpServiceMock: HttpServiceMock }> {
  const httpServiceMock = createHttpServiceMock()

  const module = await Test.createTestingModule({
    controllers: options.controllers ?? [],
    providers: [
      {
        provide: HttpService,
        useValue: httpServiceMock,
      },
      ...(options.providers ?? []),
    ],
  }).compile()

  return {
    module,
    httpServiceMock,
  }
}
