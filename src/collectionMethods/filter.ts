import { isArray } from '../dataType'
import { AnyArr, AnyObj, SKeyof, SValueof } from '../typings'

/**
 * @example
 * console.log(filter([1, 2], (v) => v > 1)) // [2]
 * console.log(filter(new Set([1, 2]), (v) => v > 1)) // Set { 2 }
 * console.log(filter(new Map([ ['a', 1], ['b', 2] ]), (v) => v > 1 )) // Map { 'b' => 2 }
 * console.log(filter({ a: 1, b: 2 }, (v) => v > 1)) // { b: 2 }
 * @version 0.0.1
 */
export default function filter<T extends AnyArr>(
  collection: T,
  predicate: (item: T[number], index: number, arr: T) => unknown
): T
export default function filter<O extends AnyObj>(
  collection: O,
  predicate: (value: SValueof<O>, key: SKeyof<O>, obj: O) => unknown
): O
export default function filter(collection, predicate) {
  return isArray(collection) ? collection.filter(predicate) : filterEntry(collection, ([k, v]) => predicate(v, k))
}

export function filterEntry<O, V extends O[keyof O], K extends keyof any>(
  collection: O,
  predicate: (entry: [key: keyof O, value: O[keyof O]], obj: O) => unknown
): { [P in K]?: V } {
  return Object.fromEntries(
    Object.entries(collection).filter(([k, v]) => predicate([k as keyof O, v], collection))
  ) as {
    [P in K]?: V
  }
}

export function filterKey<O, K extends keyof O>(
  collection: O,
  predicate: (key: keyof O, value: O[keyof O], obj: O) => unknown
): { [P in K]?: O[P] } {
  return filterEntry(collection, ([k, v]) => predicate(k, v, collection)) as {
    [P in K]?: O[P]
  }
}
