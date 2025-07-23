import CacheInterface from './cacheInterface'

export default class InMemoryCache<T> implements CacheInterface<T> {
  cache = new Map<string, { data: T; expiry: Date }>()

  constructor(private readonly prefix: string) {}

  public async set(key: string, data: T, durationSeconds: number) {
    this.cache.set(`${this.prefix}.${key}`, { data, expiry: new Date(Date.now() + durationSeconds * 1000) })
  }

  public async get(key: string) {
    const cacheEntry = this.cache.get(`${this.prefix}.${key}`)
    if (!cacheEntry || cacheEntry.expiry.getTime() < Date.now()) {
      return null
    }
    return cacheEntry.data
  }

  public async del(key: string) {
    if (this.cache.has(`${this.prefix}.${key}`)) {
      this.cache.delete(`${this.prefix}.${key}`)
    }
  }
}
