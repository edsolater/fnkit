import type { Iteratorable } from ".."
import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"
import { filter } from "./filter"

/**
 * 跳过集合前 n 个元素，惰性处理
 * Drop first n elements from collection with lazy evaluation
 *
 * 语义与 JavaScript Iterator Helper 的 drop 一致
 * Semantics align with JavaScript Iterator Helper's drop
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection
 * @param n - 跳过的元素数量 / Number of elements to skip
 * @returns 相同类型的新集合 / New collection of the same type
 *
 * @example 数组跳过（Array drop）
 * drop([1, 2, 3, 4, 5], 2) // [3, 4, 5]
 *
 * @example Set 跳过（Set drop）
 * drop(new Set([1, 2, 3]), 1) // Set { 2, 3 }
 *
 * @example Map 跳过（Map drop）
 * drop(new Map([['a', 1], ['b', 2], ['c', 3]]), 1) // Map { 'b' => 2, 'c' => 3 }
 *
 * @example 对象跳过（Object drop）
 * drop({ a: 1, b: 2, c: 3 }, 1) // { b: 2, c: 3 }
 *
 * @example Iterable 跳过（Iterable drop）
 * drop(someIterable, 2) // IteratorObject<T>
 */
export function drop<T>(collection: T[], n: number): T[]
export function drop<T>(collection: Set<T>, n: number): Set<T>
export function drop<K, V>(collection: Map<K, V>, n: number): Map<K, V>
export function drop<T>(collection: Iteratorable<T>, n: number): IteratorObject<T>
export function drop<T extends AnyObj>(collection: T, n: number): Partial<T>
export function drop(collection: any, n: number): any {
  if (isArray(collection)) {
    return filter(collection, (_, index: number) => index >= n)
  } else if (isSet(collection)) {
    return filter(collection, (_, index: number) => index >= n)
  } else if (isMap(collection)) {
    let count = 0
    return filter(collection, () => count++ >= n)
  } else if (isIterable(collection)) {
    let count = 0
    return filter(collection, () => count++ >= n)
  } else {
    // Object
    let count = 0
    return filter(collection, () => count++ >= n)
  }
}
