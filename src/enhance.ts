import { isFunction } from "./dataType"
import type { GetMapKey, GetMapValue } from "./mapAccessorUtils"

type EnhancedMapOptions = {
  /** seconds */
  freshTime?: number
  shouldOnSetCallback?: boolean
}
/**
 * original Map haven't callback or other feature, just map is too pure to use
 * enhance JS:Map
 * TODO: should have `proxifyArray` and `proxifySet` and `proxifyObject`
 */
export function enhanceMap<T extends Map<any, any>>(
  originalMap: T,
  opts?: {
    onSet?: (value: GetMapValue<T>, key: GetMapKey<T>, originMap: T) => void
  },
): Omit<T, "set"> & {
  set: (key: GetMapKey<T>, value: GetMapValue<T>, options?: EnhancedMapOptions) => T
} {
  return new Proxy(originalMap, {
    get(target, propertyName, receiver) {
      if (propertyName === "set") {
        return function newSet(key: GetMapKey<T>, value: GetMapValue<T>, options?: EnhancedMapOptions) {
          const originalMapResult = target.set(key, value)
          if (opts?.onSet && options?.shouldOnSetCallback !== false) {
            opts.onSet(value, key, target)
          }
          if (options?.freshTime) {
            setTimeout(() => {
              target.delete(key)
            }, options.freshTime * 1000)
          }
          return originalMapResult
        }
      } else {
        const originalValue = Reflect.get(target, propertyName, receiver)
        return isFunction(originalValue) ? originalValue.bind(target) : originalValue
      }
    },
  })
}
