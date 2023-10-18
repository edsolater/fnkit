import { isMemberOf } from '../compare'
import { isArray, isSet } from '../dataType'
import { AnyObj, MayArray, ShakeNever, Valueof } from '../typings'
import { filterEntry, filterKey, filter } from './filter'

type Drop<T, K> = ShakeNever<{
  [P in keyof T]: T[P] extends K ? never : T[P]
}>

/**
 * design for arry and set, object and map
 *
 * drop value
 * it use build-in method `Array.prototype.filter()`
 *
 * accept pairs
 * @param collection collection array or set or object or map
 * @param values value to drop
 * @requires {@link filter `filter()`} {@link split `split()`} {@link isOneOf `isOneOf()`} {@link isArray `isArray()`}
 * @example
 * console.log(drop([5, 2, 9], 2)) // [5, 9]
 * console.log(drop({ a: 3, b: 5 }, 3)) // { b: 5 }
 * console.log(drop({ a: 3, b: 5 }, 3, 5)) // {}
 * @version 0.0.1
 */
export function drop<T>(array: T[], items: MayArray<T>): T[]
export function drop<T>(map: Map<any, T>, items: MayArray<T>): Map<any, T>
export function drop<T>(set: Set<T>, itemList: MayArray<T>): Set<T>
export function drop<T extends AnyObj, V>(collection: T, values: MayArray<V>): Drop<T, V>
export function drop(collection, vs): any {
  const values = Array.isArray(vs) ? vs : [vs]
  return isArray(collection)
    ? dropItems(collection, values)
    : isSet(collection)
    ? dropSetItems(collection, values)
    : filter(collection, (v) => !isMemberOf(values, v))
}

export function dropEntry<O extends AnyObj>(collection: O, ...values: Valueof<O>[]) {
  return filterEntry(collection, ([k, v]) => !isMemberOf(values, v))
}

export function dropKey<O extends AnyObj>(collection: O, ...keys: Valueof<O>[]) {
  return filterKey(collection, (k) => !isMemberOf(keys, k))
}

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to drop from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
function dropItems<T>(arr: T[], items: T | T[]): T[] {
  const dropSet = new Set(Array.isArray(items) ? items : [items])
  return arr.filter((item) => !dropSet.has(item))
}

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to drop from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
function dropSetItems<T>(set: Set<T>, items: T | T[]): Set<T> {
  const dropSet = new Set(Array.isArray(items) ? items : [items])
  const newSet = new Set(set)
  for (const item of dropSet) {
    newSet.delete(item)
  }
  return newSet
}
