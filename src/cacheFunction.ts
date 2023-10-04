import { AnyFn, AnyObj } from './typings'

/**
 * invoke only once, return the cached result when invoke again
 */
export function createCachedFunction<F extends AnyFn>(
  fn: F,
  getCacheIdByParams: (...args: Parameters<F>) => any = ((p1) => p1) as any
): F {
  let cachedResult: Map<any, ReturnType<F>> = new Map()
  return function (...args: Parameters<F>) {
    const key = getCacheIdByParams(...args)
    if (!cachedResult.has(key)) {
      cachedResult.set(key, fn(...args))
    }
    return cachedResult.get(key) as ReturnType<F>
  } as F
}

/**
 *
 * all the keys will be cached, even getter
 * @returns a proxied object, which will cache the result when get the value
 */
export function createCachedObject<T extends AnyObj>(obj: T): T {
  const cachedObj = {} as T
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (Reflect.has(cachedObj, key)) {
        return Reflect.get(cachedObj, key, receiver)
      } else {
        const value = Reflect.get(target, key, receiver)
        Reflect.set(cachedObj, key, value)
        return value
      }
    },
    set(target, key, value) {
      return Reflect.set(cachedObj, key, value)
    }
  })
}
