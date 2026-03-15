import { Logger } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisService } from './redis.service'

function createMockRedisClient() {
  const connect = jest.fn<Promise<void>, []>().mockResolvedValue(undefined)
  const quit = jest.fn<Promise<void>, []>().mockResolvedValue(undefined)
  const get = jest.fn<Promise<string | null>, [string]>().mockResolvedValue(null)
  const set = jest
    .fn<Promise<void>, [string, string, ({ EX: number } | undefined)?]>()
    .mockResolvedValue(undefined)
  const publish = jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined)
  const subscribe = jest
    .fn<Promise<void>, [string, (message: string) => void]>()
    .mockResolvedValue(undefined)
  const unsubscribe = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined)
  const on = jest.fn<void, [string, (error: unknown) => void]>()

  return {
    connect,
    quit,
    get,
    set,
    publish,
    subscribe,
    unsubscribe,
    on,
  }
}


jest.mock('redis', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = jest.mocked(createClient)

describe('RedisService', () => {
  const originalRedisUrl = process.env.REDIS_URL

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.REDIS_URL
  })

  afterAll(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL
      return
    }

    process.env.REDIS_URL = originalRedisUrl
  })

  it('uses in-memory cache fallback when REDIS_URL is not configured', async () => {
    const service = new RedisService()

    await service.setJson('search:tx', { value: 42 })
    const value = await service.getJson<{ value: number }>('search:tx')

    expect(value).toEqual({ value: 42 })
    expect(mockedCreateClient).not.toHaveBeenCalled()
    expect(service.isEnabled()).toBe(false)
  })

  it('expires in-memory cache entries based on ttl', async () => {
    jest.useFakeTimers()
    const service = new RedisService()

    await service.setJson('search:ttl', { active: true }, 2)

    jest.advanceTimersByTime(1900)
    await expect(service.getJson<{ active: boolean }>('search:ttl')).resolves.toEqual({
      active: true,
    })

    jest.advanceTimersByTime(200)
    await expect(service.getJson('search:ttl')).resolves.toBeNull()

    jest.useRealTimers()
  })

  it('delivers pub/sub messages locally when Redis is unavailable', async () => {
    const service = new RedisService()
    const handler = jest.fn<void, [string]>()

    const unsubscribe = await service.subscribe('bulk-job-progress', handler)
    await service.publishJson('bulk-job-progress', { jobId: 'job-local' })

    expect(handler).toHaveBeenCalledWith(JSON.stringify({ jobId: 'job-local' }))

    await unsubscribe()
    handler.mockClear()

    await service.publishJson('bulk-job-progress', { jobId: 'job-local-2' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('connects clients and uses Redis-backed get/set/publish/subscribe flows', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379'

    const cacheClient = createMockRedisClient()
    const publisherClient = createMockRedisClient()
    const subscriberClient = createMockRedisClient()
    mockedCreateClient
      .mockReturnValueOnce(cacheClient as never)
      .mockReturnValueOnce(publisherClient as never)
      .mockReturnValueOnce(subscriberClient as never)

    cacheClient.get.mockResolvedValueOnce(JSON.stringify({ page: 1 }))

    const service = new RedisService()
    await service.onModuleInit()

    expect(service.isEnabled()).toBe(true)
    expect(mockedCreateClient).toHaveBeenCalledTimes(3)

    await service.setJson('search:redis', { a: 1 }, 60)
    await service.setJson('search:redis-no-ttl', { b: 2 })
    const cached = await service.getJson<{ page: number }>('search:redis')

    expect(cacheClient.set).toHaveBeenCalledWith('search:redis', JSON.stringify({ a: 1 }), {
      EX: 60,
    })
    expect(cacheClient.set).toHaveBeenCalledWith('search:redis-no-ttl', JSON.stringify({ b: 2 }))
    expect(cacheClient.get).toHaveBeenCalledWith('search:redis')
    expect(cached).toEqual({ page: 1 })

    const listener = jest.fn<void, [string]>()
    const unsubscribe = await service.subscribe('bulk-job-progress', listener)

    expect(subscriberClient.subscribe).toHaveBeenCalledTimes(1)

    const [, subscriberHandler] = subscriberClient.subscribe.mock.calls[0] as [
      string,
      (message: string) => void,
    ]
    subscriberHandler('{"jobId":"job-redis"}')
    expect(listener).toHaveBeenCalledWith('{"jobId":"job-redis"}')

    await service.publishJson('bulk-job-progress', { jobId: 'job-redis' })
    expect(publisherClient.publish).toHaveBeenCalledWith(
      'bulk-job-progress',
      JSON.stringify({ jobId: 'job-redis' }),
    )

    await unsubscribe()
    expect(subscriberClient.unsubscribe).toHaveBeenCalledWith('bulk-job-progress')

    await service.onModuleDestroy()
    expect(cacheClient.quit).toHaveBeenCalledTimes(1)
    expect(publisherClient.quit).toHaveBeenCalledTimes(1)
    expect(subscriberClient.quit).toHaveBeenCalledTimes(1)
  })

  it('falls back to memory and warns when redis connection fails', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379'
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)

    const failingClient = createMockRedisClient()
    const secondClient = createMockRedisClient()
    const thirdClient = createMockRedisClient()
    failingClient.connect.mockRejectedValueOnce(new Error('connection refused'))

    mockedCreateClient
      .mockReturnValueOnce(failingClient as never)
      .mockReturnValueOnce(secondClient as never)
      .mockReturnValueOnce(thirdClient as never)

    const service = new RedisService()
    await service.onModuleInit()

    expect(service.isEnabled()).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Redis unavailable, using in-memory fallback'),
    )

    await service.setJson('fallback:key', { hello: 'world' })
    await expect(service.getJson<{ hello: string }>('fallback:key')).resolves.toEqual({
      hello: 'world',
    })
  })
})
