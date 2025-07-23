import type { RedisClient } from '../redisClient'
import logger from '../../../logger'
import CacheInterface from './cacheInterface'

export default class RedisCache<T> implements CacheInterface<T> {
  constructor(
    private readonly client: RedisClient,
    private readonly prefix: string,
  ) {
    client.on('error', error => {
      logger.error(error, `Redis cache error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async set(key: string, data: T, durationSeconds: number) {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}.${key}`, JSON.stringify(data), { EX: durationSeconds })
  }

  public async get(key: string) {
    await this.ensureConnected()
    const cacheEntry = await this.client.get(`${this.prefix}.${key}`)
    if (!cacheEntry) {
      return null
    }
    try {
      return JSON.parse(cacheEntry) as T
    } catch {
      return null
    }
  }

  public async del(key: string) {
    await this.ensureConnected()
    await this.client.del(`${this.prefix}.${key}`)
  }
}
