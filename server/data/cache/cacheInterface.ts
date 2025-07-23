export default interface CacheInterface<T> {
  set(key: string, data: T, durationSeconds: number): Promise<void>
  get(key: string): Promise<T | null>
  del(key: string): Promise<void>
}
