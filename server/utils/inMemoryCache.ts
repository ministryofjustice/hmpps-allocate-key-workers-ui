export default class InMemoryCache<T> {
  cache = new Map<string, { data: T; expiry: Date }>()

  public set(key: string, data: T, durationSeconds: number) {
    this.cache.set(key, { data, expiry: new Date(Date.now() + durationSeconds * 1000) })
  }

  public get(key: string) {
    const cacheEntry = this.cache.get(key)
    if (!cacheEntry || cacheEntry.expiry.getTime() < Date.now()) {
      return null
    }
    return cacheEntry.data
  }

  public del(key: string) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
  }
}
