import { isArray, isIterable } from "../dataType"
import { AnyObj } from "../typings"

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
export function concat<T, U>(ii1: IterableIterator<T>, ii2: IterableIterator<U>): IterableIterator<T | U>
export function concat(collection, collection2) {
  if (isArray(collection) || (collection == null && isArray(collection2))) {
    return (collection ?? []).concat(collection2 ?? [])
  } else if (isIterable(collection) && isIterable(collection2)) {
    return (function* () {
      for (const item of collection) {
        yield item
      }
      for (const item of collection2) {
        yield item
      }
    })()
  } else {
    return { ...collection, ...collection2 }
  }
}
