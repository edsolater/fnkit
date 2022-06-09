import { AnyObj, isArray } from '../'
import { AnyArr, SKeyof, SValueof } from '../typings'

/**
 * design for arry object set and map
 * @example
 * console.log(every([1, 2], (v) => v > 1)) // false
 * console.log(every(new Set([1, 2]), (v) => v > 1)) // false
 * console.log(every(new Map([ ['a', 1], ['b', 2] ]), (v) => v >= 1 )) // true
 * console.log(every({ a: 1, b: 2 }, (v) => v >= 1)) // true
 */
export default function every<T extends AnyArr, U>(
  arr: T,
  predicate: (item: T[number], idx: number, arr: T) => unknown
): boolean
export default function every<O extends AnyObj, V>(
  collection: O,
  predicate: (value: SValueof<O>, key: SKeyof<O>, obj: O) => unknown
): boolean
export default function every(collection, predicate): boolean {
  return isArray(collection)
    ? collection.every(predicate)
    : everyEntry(collection, ([key, value], collection) => predicate(value, key, collection))
}

export function everyEntry<O>(
  collection: O,
  predicate: (entry: [key: SKeyof<O>, value: SValueof<O>], obj: O) => unknown
): boolean {
  return Object.entries(collection).every(([key, value]) => predicate([key as SKeyof<O>, value], collection))
}

export function everyKey<O>(collection: O, predicate: (key: keyof O, value: O[keyof O], obj: O) => unknown): boolean {
  return everyEntry(collection, ([key, value], collection) => predicate(key, value, collection))
}
