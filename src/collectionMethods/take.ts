import { isArray, isIterable, isMap, isSet, isUndefined } from "../dataType"
import type { Collection } from "./type"

/**
 * like array.prototype.slice, but support all collection type
 */
export function take<T extends Collection>(collection: T, count: number): T {
  if (isUndefined(collection)) return collection
  if (isArray(collection)) return count >= 0 ? (collection.slice(0, count) as T) : ([] as any)
  if (isSet(collection)) {
    const result = new Set<T>()
    let index = 0
    for (const item of collection) {
      if (index >= count) break
      result.add(item)
      index++
    }
    return result as T
  }
  if (isMap(collection)) {
    const result = new Map()
    let index = 0
    for (const [key, value] of collection) {
      if (index >= count) break
      result.set(key, value)
      index++
    }
    return result as T
  }
  if (isIterable(collection)) {
    // https://github.com/tc39/proposal-iterator-helpers
    throw new Error("take not support iterable, wait for tc39's iterator utils proposal")
  } else {
    const result: Record<any, any> = {}
    let index = 0
    for (const key in collection) {
      if (index >= count) break
      result[key] = collection[key]
      index++
    }
    return result as T
  }
}
