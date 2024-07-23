import type { GetMapValue, GetMapKey } from "./mapAccessorUtils"

/**
 * original Map haven't callback or other feature, just map is too pure to use
 * proxifyMap
 * TODO: should have `proxifyArray` and `proxifySet` and `proxifyObject`
 */
export function proxifyMap<T extends Map<any, any>>(
  originalMap: T,
  opts?: {
    onSet?: (value: GetMapValue<T>, key: GetMapKey<T>, originMap: T) => void
  },
): T {
  const newMap = new Map(originalMap) as T
  newMap.set = (key, value) => {
    const result = originalMap.set(key, value)
    opts?.onSet?.(value, key, newMap)
    return result
  }
  return newMap
}
