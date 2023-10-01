import { isArray } from '../dataType'
import { AnyArr, AnyObj, SKeyof, Valueof } from '../typings'

/**
 * @example
 * console.log(filter([1, 2], (v) => v > 1)) // [2]
 * console.log(filter(new Set([1, 2]), (v) => v > 1)) // Set { 2 }
 * console.log(filter(new Map([ ['a', 1], ['b', 2] ]), (v) => v > 1 )) // Map { 'b' => 2 }
 * console.log(filter({ a: 1, b: 2 }, (v) => v > 1)) // { b: 2 }
 * @version 0.0.1
 */
export function filter<T extends AnyArr>(
  collection: T,
  predicate: (item: T[number], index: number, arr: T) => unknown
): T
export function filter<O extends AnyObj>(
  collection: O,
  predicate: (value: Valueof<O>, key: SKeyof<O>, obj: O) => unknown
): O
export function filter(collection, predicate) {
  return isArray(collection) ? collection.filter(predicate) : filterEntry(collection, ([k, v]) => predicate(v, k))
}

export function filterEntry<O extends object, V extends Valueof<O>, K extends keyof any>(
  collection: O,
  predicate: (entry: [key: SKeyof<O>, value: Valueof<O>], obj: O) => unknown
): { [P in K]?: V } {
  return Object.fromEntries(
    Object.entries(collection).filter(([k, v]) => predicate([k as SKeyof<O>, v], collection))
  ) as {
    [P in K]?: V
  }
}

export function filterKey<O extends object, K extends keyof O>(
  collection: O,
  predicate: (key: SKeyof<O>, value: Valueof<O>, obj: O) => unknown
): { [P in K]?: O[P] } {
  return filterEntry(collection, ([k, v]) => predicate(k, v, collection)) as {
    [P in K]?: O[P]
  }
}
