import { isArray, isIterable, isMap, isSet } from "../dataType";
import type { AnyObj } from "../typings";
import {
  getIteratorInnerKey,
  getIteratorInnerValue,
  type Entriable,
  type EntriableKey,
  type EntriableValue,
  type Itemable,
  type ItemableValue
} from "./iteratorableItemAndEntry";
import { toIterator } from "./iteratorableUtils";

/**
 * 查找第一个匹配的元素，短路求值（不需要惰性）
 * Find first matching element with short-circuit evaluation (no lazy needed)
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to search
 * @param predicate - 断言函数 (value, key) => boolean / Predicate function
 * @returns 第一个匹配的元素或 undefined / First matching element or undefined
 *
 * @example 数组查找（Array find）
 * find([1, 2, 3], v => v > 1) // 2
 *
 * @example Set 查找（Set find）
 * find(new Set([1, 2, 3]), v => v > 1) // 2
 *
 * @example Map 查找（Map find）
 * find(new Map([['a', 1], ['b', 2]]), v => v > 1) // 2
 *
 * @example 对象查找（Object find）
 * find({ a: 1, b: 2 }, v => v > 1) // 2
 */
export function find<T>(arr: T[], predicate: (value: T, index: number) => unknown): T | undefined
export function find<T>(set: Set<T>, predicate: (value: T, index: number) => unknown): T | undefined
export function find<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => unknown): { key: K; value: V } | undefined
export function find<T extends Itemable>(
  iterable: Iterable<T>,
  predicate: (value: ItemableValue<T>, index: number) => unknown,
): T | undefined
export function find<T extends Entriable>(
  iterable: Iterable<T>,
  predicate: (value: EntriableValue<T>, key: EntriableKey<T>) => unknown,
): T | undefined
export function find<T extends AnyObj>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => unknown,
): { key: keyof T; value: T[keyof T] } | undefined
export function find(collection: any, predicate: any): any {
  if (isArray(collection)) {
    return collection.find(predicate)
  } else if (isSet(collection)) {
    return collection.values().find((v, i) => predicate(v, i))
  } else if (isMap(collection)) {
    const result = collection.entries().find(([k, v]) => predicate(v, k))
    return result ? { key: result[0], value: result[1] } : undefined
  } else if (isIterable(collection)) {
    const result = toIterator(collection).find((v, i) =>
      predicate(getIteratorInnerValue(v), getIteratorInnerKey(v) ?? i),
    )
    return result
  } else {
    // Object
    for (const k in collection) {
      if (predicate(collection[k], k)) return { key: k, value: collection[k] }
    }
    return undefined
  }
}
