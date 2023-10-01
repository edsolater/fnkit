import { isArray } from '../dataType'
import { AnyObj } from '../typings'

/**
 * append another collection to the end of current collection
 * @param arr collection array or object
 * @param values value to append
 * @requires {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * concat([1, 2, 3], ['hello', 'world']) // [1, 2, 3, 'hello', 'world']
 * concat({ a: 1, b: 3 }, { hello: 'world' }) // { a: 1, b: 3, hello: 'world' }
 */
export function concat<T, D>(arr1: T[] | undefined, arr2: D[] | undefined): (T | D)[]
export function concat<T extends AnyObj | undefined, D extends AnyObj | undefined>(obj1: T, obj2: D): T & D
export function concat(collection, collection2) {
  if (isArray(collection)) {
    return [...(collection ?? []), ...(collection2 ?? [])]
  } else {
    return { ...collection, ...collection2 }
  }
}
