import {
  Collection,
  isArray
} from '../'
import {
  GetCollectionKey,
  GetCollectionValue
} from './'
import {
  getEntryKey,
  getEntryValue,
  toEntries
} from './entries'

/**
 * design for arry object set and map
 * @example
 * console.log(some([1, 2], (v) => v > 1)) // true
 * console.log(some(new Set([1, 2]), (v) => v > 1)) // true
 * console.log(some(new Map([['a', 1], ['b', 2]]), (v) => v >= 1 )) // true
 * console.log(some({ a: 1, b: 2 }, (v) => v >= 1)) // true
 * @version 0.0.1
 */
export default function some<C extends Collection>(
  collection: C,
  predicate: (value: GetCollectionValue<C>, key: GetCollectionKey<C>) => unknown
): boolean {
  if (isArray(collection)) {
    // @ts-expect-error faster for build-in method, no need type check
    return collection.some(predicate) 
  }
  const entries = toEntries(collection)
  return entries.some((entry) => predicate(getEntryValue(entry), getEntryKey(entry)))
}
