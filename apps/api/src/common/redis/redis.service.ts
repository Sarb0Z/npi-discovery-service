import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { createClient, type RedisClientType } from 'redis'

type RedisMessageHandler = (message: string) => void

interface MemoryCacheEntry {
  value: string
  expiresAt: number | null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Redis error'
}

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisService.name)
  private readonly redisUrl = process.env.REDIS_URL?.trim()
  private readonly memoryCache = new Map<string, MemoryCacheEntry>()
  private readonly memorySubscribers = new Map<string, Set<RedisMessageHandler>>()
  private readonly channelHandlers = new Map<string, Set<RedisMessageHandler>>()

  private client?: RedisClientType
  private publisher?: RedisClientType
  private subscriber?: RedisClientType
  private connected = false
  private connecting?: Promise<void>

  async onModuleInit(): Promise<void> {
    await this.ensureConnected()
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([this.client?.quit(), this.publisher?.quit(), this.subscriber?.quit()])
  }

  isEnabled(): boolean {
    return this.connected
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (await this.ensureConnected()) {
      const value = await this.client?.get(key)

      return value ? (JSON.parse(value) as T) : null
    }

    const entry = this.memoryCache.get(key)

    if (!entry) {
      return null
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.memoryCache.delete(key)
      return null
    }

    return JSON.parse(entry.value) as T
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value)

    if (await this.ensureConnected()) {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client?.set(key, serializedValue, { EX: ttlSeconds })
        return
      }

      await this.client?.set(key, serializedValue)
      return
    }

    this.memoryCache.set(key, {
      value: serializedValue,
      expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    })
  }

  async publishJson(channel: string, payload: unknown): Promise<void> {
    const message = JSON.stringify(payload)

    if (await this.ensureConnected()) {
      await this.publisher?.publish(channel, message)
      return
    }

    this.dispatchLocalMessage(channel, message)
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<() => Promise<void>> {
    let handlers = this.channelHandlers.get(channel)

    if (!handlers) {
      handlers = new Set<RedisMessageHandler>()
      this.channelHandlers.set(channel, handlers)
    }

    const shouldRegisterRemoteSubscription = handlers.size === 0 && (await this.ensureConnected())
    handlers.add(handler)

    if (shouldRegisterRemoteSubscription) {
      await this.subscriber?.subscribe(channel, (message) => {
        this.dispatchChannelMessage(channel, message)
      })
    }

    if (!this.connected) {
      const localHandlers = this.memorySubscribers.get(channel) ?? new Set<RedisMessageHandler>()
      localHandlers.add(handler)
      this.memorySubscribers.set(channel, localHandlers)
    }

    return async () => {
      const registeredHandlers = this.channelHandlers.get(channel)

      registeredHandlers?.delete(handler)

      if (registeredHandlers?.size === 0) {
        this.channelHandlers.delete(channel)

        if (this.connected) {
          await this.subscriber?.unsubscribe(channel)
        }
      }

      const localHandlers = this.memorySubscribers.get(channel)
      localHandlers?.delete(handler)

      if (localHandlers?.size === 0) {
        this.memorySubscribers.delete(channel)
      }
    }
  }

  private async ensureConnected(): Promise<boolean> {
    if (!this.redisUrl) {
      return false
    }

    if (this.connected) {
      return true
    }

    this.connecting ??= this.connectClients()

    await this.connecting

    return this.connected
  }

  private async connectClients(): Promise<void> {
    try {
      this.client = createClient({ url: this.redisUrl })
      this.publisher = createClient({ url: this.redisUrl })
      this.subscriber = createClient({ url: this.redisUrl })

      this.client.on('error', (error) => {
        this.logger.error(`Redis client error: ${getErrorMessage(error)}`)
      })
      this.publisher.on('error', (error) => {
        this.logger.error(`Redis publisher error: ${getErrorMessage(error)}`)
      })
      this.subscriber.on('error', (error) => {
        this.logger.error(`Redis subscriber error: ${getErrorMessage(error)}`)
      })

      await Promise.all([
        this.client.connect(),
        this.publisher.connect(),
        this.subscriber.connect(),
      ])
      this.connected = true
      this.logger.log('Redis connected for cache and pub/sub')
    } catch (error) {
      this.connected = false
      this.client = undefined
      this.publisher = undefined
      this.subscriber = undefined
      const message = error instanceof Error ? error.message : 'Unknown Redis connection failure'
      this.logger.warn(`Redis unavailable, using in-memory fallback: ${message}`)
    } finally {
      this.connecting = undefined
    }
  }

  private dispatchLocalMessage(channel: string, message: string): void {
    this.memorySubscribers.get(channel)?.forEach((handler) => {
      handler(message)
    })
  }

  private dispatchChannelMessage(channel: string, message: string): void {
    this.channelHandlers.get(channel)?.forEach((handler) => {
      handler(message)
    })
  }
}
