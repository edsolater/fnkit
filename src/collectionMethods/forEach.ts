import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings/baseTypes"
import { getIteratorInnerKey, getIteratorInnerValue } from "./iteratorableItemAndEntry"
import { toIterator, type Iteratorable } from "./iteratorableUtils"

/** the Method of map`filter`some etc. */
export function forEach<T>(
  collection: readonly T[],
  predicate: (item: T, index: number, arr: readonly T[]) => void,
): void
export function forEach<K>(collection: Set<K>, predicate: (item: K, key: K, original: Set<K>) => void): void
export function forEach<K, V>(collection: Map<K, V>, predicate: (value: V, key: K, original: Map<K, V>) => void): void
export function forEach<O extends AnyObj>(
  collection: O,
  predicate: (value: O[keyof O], key: keyof O, obj: O) => void,
): void
export function forEach<K, V>(
  collection: Iteratorable<[K, V]>,
  predicate: (item: V, key: K, original: Iterable<[K, V]>) => void,
): void
export function forEach(collection, predicate) {
  // 处理 null/undefined
  if (collection == null) return

  if (isArray(collection)) {
    return collection.forEach(predicate)
  } else if (isSet(collection)) {
    for (const k of collection) predicate(k, k, collection)
  } else if (isMap(collection)) {
    for (const [k, v] of collection) predicate(v, k, collection)
  } else if (isIterable(collection)) {
    const iterator = toIterator(collection)
    iterator.forEach((v, i) => {
      predicate(getIteratorInnerValue(v), getIteratorInnerKey(v) ?? i, collection)
    })
  } else {
    Object.entries(collection).forEach(([k, v]) => predicate(v, k, collection))
  }
}