import { isArray, isIterable, isMap, isObject, isSet } from "../dataType"
import type { AnyObj } from "../typings"
import { filter } from "./filter"
import type { Collection } from "./type"

/**
 * 保留集合前 n 个元素惰性处理
 * Take first n elements from collection with lazy evaluation
 *
 * 语义与 JavaScript Iterator Helper 的 take 一致
 * Semantics align with JavaScript Iterator Helper's take
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection
 * @param n - 保留的元素数量 / Number of elements to keep
 * @returns 相同类型的新集合 / New collection of the same type
 *
 * @example 数组保留（Array take）
 * take([1, 2, 3, 4, 5], 3) // [1, 2, 3]
 *
 * @example Set 保留（Set take）
 * take(new Set([1, 2, 3]), 2) // Set { 1, 2 }
 *
 * @example Map 保留（Map take）
 * take(new Map([['a', 1], ['b', 2], ['c', 3]]), 2) // Map { 'a' => 1, 'b' => 2 }
 *
 * @example 对象保留（Object take）
 * take({ a: 1, b: 2, c: 3 }, 2) // { a: 1, b: 2 }
 */
export function take<T>(collection: T[], n: number): T[]
export function take<T>(collection: Set<T>, n: number): Set<T>
export function take<K, V>(collection: Map<K, V>, n: number): Map<K, V>
export function take<T>(collection: Iterable<T>, n: number): IterableIterator<T>
export function take<T extends AnyObj>(collection: T, n: number): Partial<T>
export function take(collection: any, n: number): any {
  if (isArray(collection)) {
    return filter(collection, (_, index: number) => index < n)
  } else if (isSet(collection)) {
    return filter(collection, (_, index: number) => index < n)
  } else if (isMap(collection)) {
    let count = 0
    return filter(collection, () => count++ < n)
  } else if (isIterable(collection)) {
    let count = 0
    return filter(collection, () => count++ < n)
  } else {
    // Object
    let count = 0
    return filter(collection, () => count++ < n)
  }
}
