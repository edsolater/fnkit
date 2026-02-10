import { getIteratorInnerKey, getIteratorInnerValue, isIterableOrIterator, toIterator, type Iteratorable, type Keyof, type ValueOf } from ".."
import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"

/**
 * 检查是否所有元素匹配，短路求值（不需要惰性）
 * Check if all elements match with short-circuit evaluation (no lazy needed)
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to check
 * @param predicate - 断言函数 (value, key) => boolean / Predicate function
 * @returns 是否所有元素匹配 / Whether all elements match
 *
 * @example 数组检查（Array every）
 * every([1, 2, 3], v => v > 0) // true
 *
 * @example Set 检查（Set every）
 * every(new Set([1, 2, 3]), v => v > 0) // true
 *
 * @example Map 检查（Map every）
 * every(new Map([['a', 1], ['b', 2]]), v => v > 0) // true
 *
 * @example 对象检查（Object every）
 * every({ a: 1, b: 2 }, v => v > 0) // true
 */
export function every<T>(arr: T[], predicate: (value: T, index: number) => unknown): boolean
export function every<T>(set: Set<T>, predicate: (value: T, index: number) => unknown): boolean
export function every<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => unknown): boolean
export function every<T extends Iteratorable>(
  iterable: T,
  predicate: (value: ValueOf<T>, index: Keyof<T>) => unknown,
): boolean
export function every<T extends AnyObj>(obj: T, predicate: (value: ValueOf<T>, key: Keyof<T>) => unknown): boolean
export function every(collection: any, predicate: any): boolean {
  if (isArray(collection)) return collection.every(predicate)
  if (isSet(collection)) return collection.values().every((v, i) => predicate(v, i))
  if (isMap(collection)) return collection.entries().every(([k, v]) => predicate(v, k))
  if (isIterableOrIterator(collection)) return toIterator(collection).every((v, i) => predicate(getIteratorInnerValue(v), getIteratorInnerKey(v)?? i))

  {
    // Object
    for (const k in collection) {
      if (!predicate(collection[k], k)) return false
    }
    return true
  }
}
