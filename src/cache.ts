import { createShallowMap } from "./shallowMap"

type AnyFunction = (...args: any[]) => void
type CachedFunction<F extends AnyFunction> = F

/**
 * make function cacheable
 */
export function cache<F extends AnyFunction>(
  originalFn: F,
  options?: {
    getCacheValue?: (args: Parameters<F>) => ReturnType<F> | undefined
    onResult?: (args: Parameters<F>, result: ReturnType<F>) => void
  },
): CachedFunction<F> {
  const cache = createShallowMap<Parameters<F>, ReturnType<F>>()
  //@ts-expect-error
  return (...args: Parameters<F>) => {
    if (options?.getCacheValue) {
      const cacheValue = options.getCacheValue(args)
      if (cacheValue) {
        cache.set(args, cacheValue)
        return cacheValue
      }
    }
    if (cache.has(args)) return cache.get(args)
    else {
      //@ts-expect-error
      const returnedValue: ReturnType<F> = originalFn(...args)
      cache.set(args, returnedValue)
      return returnedValue
    }
  }
}

/** result will be calc only once */
export function cacheFn<F extends AnyFunction>(originalFn: F): CachedFunction<F> {
  let output: { result: ReturnType<F> } | undefined = undefined
  //@ts-expect-error
  return (...args: Parameters<F>) => {
    if (output) return output.result
    else {
      //@ts-expect-error
      const returnedValue: ReturnType<F> = originalFn(...args)
      output = { result: returnedValue }
      return returnedValue
    }
  }
}
