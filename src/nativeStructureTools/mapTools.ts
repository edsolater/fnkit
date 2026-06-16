import { isFunction, isNullish } from "../dataType"

export type GetMapKey<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never
export type GetMapValue<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never

/**
 * return same map, means this is a mutate function
 */
export function mutablySortMapByKey<T extends Map<any, any>>(
  map: T,
  /** just like Array.prototype.sort's compareFn */
  compareFn: (aKey: GetMapKey<T>, bKey: GetMapKey<T>) => number,
): T {
  const items = Array.from(map.entries()).sort((a, b) => compareFn(a[0], b[0]))
  map.clear()
  for (const item of items) {
    map.set(item[0], item[1])
  }
  return map
}

/**
 * return a new map
 */
export function sortMapByKey<T extends Map<any, any>>(
  map: T,
  /** just like Array.prototype.sort's compareFn */
  compareFn: (aKey: GetMapKey<T>, bKey: GetMapKey<T>) => number,
) {
  return new Map([...map.entries()].sort((a, b) => compareFn(a[0], b[0])))
}

export function sliceMap<T extends Map<any, any>>(map: T, startIndex: number, endIndex?: number): T {
  if (systemSupportInteratorHelper()) {
    const entries = map.entries()
    const start = startIndex >= 0 ? startIndex : map.size + startIndex
    const end = endIndex !== undefined ? (endIndex >= 0 ? endIndex : map.size + endIndex) : map.size
    const dropped = entries.drop(start)
    const taken = end !== undefined ? dropped.take(end - start) : dropped
    return new Map(taken) as T
  } else {
    const result = new Map() as T
    let index = 0

    for (const [key, value] of map.entries()) {
      if (index >= startIndex && (endIndex === undefined || index < endIndex)) {
        result.set(key, value)
      }
      index++
      if (endIndex !== undefined && index >= endIndex) {
        break
      }
    }

    return result
  }
}

function systemSupportInteratorHelper() {
  return isFunction([].values().map)
}

export function sliceMapKey<T extends Map<any, any>>(map: T, start: GetMapKey<T>, end?: GetMapKey<T>) {
  let startIndex = 0
  let endIndex: number | undefined = end ? 0 : undefined
  const contentArray = [...map.entries()]
  for (let i = 0; i < contentArray.length; i++) {
    const key = contentArray[i][0]
    if (key === start) {
      startIndex = i
      if (isNullish(end)) break
    }
    if (key === end) {
      endIndex = i
      break
    }
  }
  return sliceMap(map, startIndex, endIndex)
}

/** basic util function
 *
 * @param cacheMap provide a cache map
 * @param key the key of the cache map
 * @param createIfNotInCacheMap create a new value if the key is not in the cache map
 */
export function mapGet<T extends Map<any, any>>(
  cacheMap: T,
  key: GetMapKey<T>,
  createIfNotInCacheMap: () => GetMapValue<T>,
): GetMapValue<T> {
  if (!cacheMap.has(key)) {
    const newValue = createIfNotInCacheMap()
    cacheMap.set(key, newValue)
  }
  return cacheMap.get(key)!
}
