import { isFunction } from "./dataType"
import { shrinkFn } from "./wrapper"

type EnhancedMapSetOptions = {
  /** seconds */
  freshTime?: number
  shouldOnSetCallback?: boolean
}

export type EnhancedMap<K, V = any> = Omit<Map<K, V>, "set"> & {
  set: (
    key: K,
    value: V | ((value: V | undefined) => V),
    options?: EnhancedMapSetOptions,
  ) => ReturnType<Map<K, V>["set"]>
  update: (key: K, value: V | ((value: V) => V), options?: EnhancedMapSetOptions) => ReturnType<Map<K, V>["set"]>
}

export type EnhancedMapOptions<K, V = any> = {
  onSet?: (value: V, key: K, originMap: Map<K, V>) => void
}

/**
 * original Map haven't callback or other feature, just map is too pure to use
 * enhance JS:Map
 * TODO: should have `proxifyArray` and `proxifySet` and `proxifyObject`
 */
export function enhanceMap<K, V = any>(originalMap: Map<K, V>, opts?: EnhancedMapOptions<K, V>): EnhancedMap<K, V> {
  // @ts-expect-error force
  return new Proxy(originalMap, {
    get(target, propertyName, receiver) {
      function newSet(key: K, value: V | ((value: V | undefined) => V), options?: EnhancedMapSetOptions) {
        const shrinkedValue = shrinkFn(value, [target.get(key)]) as V
        const originalMapResult = target.set(key, shrinkedValue)
        if (opts?.onSet && options?.shouldOnSetCallback !== false) {
          opts.onSet(shrinkedValue, key, target)
        }
        if (options?.freshTime) {
          setTimeout(() => {
            target.delete(key)
          }, options.freshTime * 1000)
        }
        return originalMapResult
      }

      function update(key: K, value: V | ((value: V) => V), options?: EnhancedMapSetOptions) {
        return newSet(
          key,
          (v) => {
            if (v === undefined) {
              throw new Error(`can't update a undefined value`)
            } else {
              return shrinkFn(value, [v])
            }
          },
          options,
        )
      }

      if (propertyName === "set") {
        return newSet
      } else if (propertyName === "update") {
        return update
      } else {
        const originalValue = Reflect.get(target, propertyName, receiver)
        return isFunction(originalValue) ? originalValue.bind(target) : originalValue
      }
    },
  })
}
