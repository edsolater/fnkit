import { type Collectionable, type GetCollectionValue, type GetCollectionKey, assert } from ".."
import { getType, isArray, isIterable, isIterator, isMap, isObject, isSet } from "../dataType"

export type IterableCollection<E = any> = Iterable<E> | IterableIterator<E> | Iterator<E>
export function isIterableOrIterator(v: unknown): v is IterableCollection<any> {
  return isIterable(v) || isIterator(v)
}
export function toIterable<T>(target: Iterator<T> | Iterable<T> | IterableIterator<T>): Iterable<T> {
  assert(isIterableOrIterator(target), `toIterable: target is not iterable or iterator`)
  if (isIterable(target)) return target
  if (isIterator(target)) {
    return {
      [Symbol.iterator]() {
        return target
      },
    }
  }
  throw new Error(`toIterable: unsupported target type: ${getType(target)}`)
}

/** auto-detect whether it should use {@link toIterableValue} or {@link toIterableEntries}
 * @example
 * toIterable([1, 2]) // [1, 2]
 * toIterable({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function toCollectionIterator<C extends Collectionable>(
  collection: C,
): Iterable<[GetCollectionValue<C> | GetCollectionKey<C>]> {
  if (isIterable(collection)) return collection as any
  if (isSet(collection)) return collection.values().map((v, idx) => [v, idx]) as any
  if (isArray(collection)) return collection.values().map((v, idx) => [v, idx]) as any
  if (isMap(collection)) return collection.entries().map(([k, v]) => [v, k]) as any
  if (isObject(collection)) return Object.entries(collection) as any
  throw new Error(`toCollectionIterable: unsupported collection type: ${typeof collection}`)
}
