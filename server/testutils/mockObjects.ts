type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> | null : T[P] | null
}

/** Create a mock object by providing a template and a set of partial overrides. */
export function createMock<T>(defaults: T, partial: RecursivePartial<T>): T {
  function deepMerge<U>(target: U, source: U): U {
    if (source === undefined) return target
    if (source === null) return undefined as unknown as U

    if (typeof target === 'object' && target !== null && typeof source === 'object' && source !== null) {
      const result: U = (Array.isArray(target) ? [...target] : { ...target }) as U

      for (const key of Object.keys(source)) {
        const uKey = key as keyof U
        const mergedValue = deepMerge(target?.[uKey], source[uKey])

        if (mergedValue === undefined) {
          if (Array.isArray(result)) {
            const index = Number(key)
            if (!Number.isNaN(index)) {
              result.splice(index, 1)
            }
          } else {
            delete result[uKey]
          }
        } else {
          result[uKey] = mergedValue
        }
      }
      return result
    }
    return source
  }

  return deepMerge(defaults, partial) as T
}
