import { LazyPromise } from "./customizedClasses"
import { isArray, isObject, isPromise } from "./dataType"

/**
 * only for object
 * @example
 * DeepPromisify<{hello: 'world', foo: Promise<{bar: 'baz'}>}> // {hello: 'world', foo: {bar: Promise<'baz'>}
 * DeepPromisify<Promise<{hello: 'world', foo: Promise<{bar: 'baz'}>}> // {hello: Promise<'world'>, foo: {bar: Promise<'baz'>}
 */
export type DeepPromisify<T, OutsideHasPromised = T extends Promise<any> ? true : false> =
  Awaited<T> extends Record<keyof any, any>
    ? {
        [K in keyof Awaited<T>]: DeepPromisify<
          Awaited<T>[K],
          OutsideHasPromised extends true ? true : Awaited<T>[K] extends Promise<any> ? true : false
        >
      }
    : OutsideHasPromised extends true
      ? Promise<Awaited<T>>
      : Awaited<T>

/**
 * only object
 * @example
 * PromisifyObject<{hello: 'world', foo: Promise<{bar: 'baz'}>}> // {hello: 'world', foo: Promise<{bar: 'baz'}>}
 */
export function deepPromisify<T extends Record<keyof any, any>>(value?: Promise<undefined | T> | T): DeepPromisify<T> {
  if (isPromise(value)) {
    const asyncObject = value
    return new Proxy(asyncObject, {
      get(target, p, receiver) {
        return target.then((obj) => deepPromisify(obj != null ? Reflect.get(obj, p, receiver) : obj))
      },
    }) as any
  }
  if (isObject(value) && !isPromise(value) && !isArray(value)) {
    const object = value
    return new Proxy(object, {
      get(target, p, receiver) {
        return deepPromisify(Reflect.get(target, p, receiver))
      },
    }) as any
  }
  return value as any
}

/**
 * make `Promise<Record<K, V>>` to `Record<K, Promise<V>>`
 */
export function promisifyObject<T extends Record<keyof any, any>>(
  value?: Promise<undefined | T>,
): { [K in keyof T]: Promise<Awaited<T[K]>> }
export function promisifyObject<T>(value?: T): T
export function promisifyObject<T extends Record<keyof any, any>>(
  value?: Promise<undefined | T> | T,
): { [K in keyof T]: Promise<Awaited<T[K]>> | T } {
  if (isPromise(value)) {
    const asyncValue = LazyPromise.resolve(() => value)
    return new Proxy(
      {},
      {
        get(_target, p, _receiver) {
          return asyncValue.then((v) => v?.[p])
        },
      },
    ) as { [K in keyof T]: T[K] extends Promise<any> ? Promise<T[K]> : T[K] }
  }
  return value as T
}

/**
 * make `Promise<Record<K, V>>` to `Record<K, Promise<V>>`
 */
export function promisifyArray<V>(
  value: Promise<V[] | undefined> | undefined,
  deconstructionArrLength = 8,
): Promise<V>[] {
  const asyncValue = LazyPromise.resolve(() => value)
  return new Proxy([], {
    get(_target, p, _receiver) {
      if (p === Symbol.iterator) {
        return function* () {
          yield* Array.from({ length: deconstructionArrLength }, (_, idx) => asyncValue.then((v) => v?.[idx]))
        }
      }
      return asyncValue.then((v) => v?.[p])
    },
  }) as Promise<V>[]
}
