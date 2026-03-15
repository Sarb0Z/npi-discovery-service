import { Logger } from '@nestjs/common'
import type { BulkJobProgressDto } from '@npi/contracts'
import type { Socket } from 'socket.io'
import type { RedisService } from '../../common/redis/redis.service'
import {
  BULK_JOB_PROGRESS_EVENT,
  BULK_JOB_SUBSCRIBE_EVENT,
  BulkCollectionGateway,
} from './bulk-collection.gateway'

describe('BulkCollectionGateway', () => {
  let redisService: {
    subscribe: jest.Mock
    publishJson: jest.Mock
    isEnabled: jest.Mock
  }
  let gateway: BulkCollectionGateway

  beforeEach(() => {
    redisService = {
      subscribe: jest.fn().mockResolvedValue(jest.fn().mockResolvedValue(undefined)),
      publishJson: jest.fn().mockResolvedValue(undefined),
      isEnabled: jest.fn().mockReturnValue(false),
    }

    gateway = new BulkCollectionGateway(redisService as unknown as RedisService)
    jest.clearAllMocks()
  })

  it('subscribes to Redis on module init and emits valid payloads', async () => {
    const emit = jest.fn()
    const to = jest.fn().mockReturnValue({ emit })
    gateway.server = { to } as never

    await gateway.onModuleInit()

    expect(redisService.subscribe).toHaveBeenCalledTimes(1)

    const [, handler] = redisService.subscribe.mock.calls[0] as [string, (message: string) => void]
    const progress: BulkJobProgressDto = {
      jobId: 'job-1',
      status: 'PROCESSING',
      message: 'working',
      totalProvidersFound: 10,
      collectedProviders: 2,
      estimatedRemainingProviders: 8,
    }

    handler(JSON.stringify(progress))

    expect(to).toHaveBeenCalledWith('job-1')
    expect(emit).toHaveBeenCalledWith(BULK_JOB_PROGRESS_EVENT, progress)
  })

  it('warns and ignores malformed Redis payloads', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)

    await gateway.onModuleInit()

    const [, handler] = redisService.subscribe.mock.calls[0] as [string, (message: string) => void]
    handler('not-json')

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ignoring malformed bulk progress payload'),
    )
  })

  it('joins room on connection when jobId is provided in auth', () => {
    const join = jest.fn().mockResolvedValue(undefined)
    const client = {
      handshake: {
        auth: { jobId: ' job-auth ' },
        query: {},
      },
      join,
    } as unknown as Socket

    gateway.handleConnection(client)

    expect(join).toHaveBeenCalledWith('job-auth')
  })

  it('handles explicit subscribe message', () => {
    const join = jest.fn().mockResolvedValue(undefined)
    const client = {
      handshake: {
        auth: {},
        query: {},
      },
      join,
    } as unknown as Socket

    gateway.handleSubscription(client, { jobId: ' job-explicit ' })

    expect(join).toHaveBeenCalledWith('job-explicit')
  })

  it('publishes through Redis when enabled and falls back to local emit on publish error', async () => {
    redisService.isEnabled.mockReturnValue(true)
    redisService.publishJson.mockRejectedValueOnce(new Error('redis down'))

    const emit = jest.fn()
    const to = jest.fn().mockReturnValue({ emit })
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    gateway.server = { to } as never

    const progress: BulkJobProgressDto = {
      jobId: 'job-fallback',
      status: 'COMPLETED',
      message: 'done',
      totalProvidersFound: 10,
      collectedProviders: 10,
      estimatedRemainingProviders: 0,
    }

    gateway.publishProgress(progress)
    await Promise.resolve()

    expect(redisService.publishJson).toHaveBeenCalledWith('bulk-job-progress', progress)
    expect(to).toHaveBeenCalledWith('job-fallback')
    expect(emit).toHaveBeenCalledWith(BULK_JOB_PROGRESS_EVENT, progress)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Redis bulk progress publish failed, emitting locally'),
    )
  })

  it('emits locally when Redis is disabled', () => {
    redisService.isEnabled.mockReturnValue(false)

    const emit = jest.fn()
    const to = jest.fn().mockReturnValue({ emit })
    gateway.server = { to } as never

    gateway.publishProgress({
      jobId: 'job-local',
      status: 'PROCESSING',
      message: 'working',
      totalProvidersFound: 5,
      collectedProviders: 1,
      estimatedRemainingProviders: 4,
    })

    expect(redisService.publishJson).not.toHaveBeenCalled()
    expect(to).toHaveBeenCalledWith('job-local')
    expect(emit).toHaveBeenCalledWith(
      BULK_JOB_PROGRESS_EVENT,
      expect.objectContaining({ jobId: 'job-local' }),
    )
  })

  it('unsubscribes from Redis on module destroy', async () => {
    const unsubscribe = jest.fn().mockResolvedValue(undefined)
    redisService.subscribe.mockResolvedValueOnce(unsubscribe)

    await gateway.onModuleInit()
    await gateway.onModuleDestroy()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('exposes the subscribe event constant for transport handlers', () => {
    expect(BULK_JOB_SUBSCRIBE_EVENT).toBe('bulk-job:subscribe')
  })
})
