import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"

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
export function find<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => unknown): V | undefined
export function find<T>(iterable: Iterable<T>, predicate: (value: T, index: number) => unknown): T | undefined
export function find<T extends AnyObj>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => unknown,
): T[keyof T] | undefined
export function find(collection: any, predicate: any): any {
  if (isArray(collection)) {
    return collection.find(predicate)
  } else if (isSet(collection)) {
    let index = 0
    for (const v of collection) {
      if (predicate(v, index++)) return v
    }
    return undefined
  } else if (isMap(collection)) {
    for (const [k, v] of collection) {
      if (predicate(v, k)) return v
    }
    return undefined
  } else if (isIterable(collection)) {
    let index = 0
    for (const v of collection) {
      if (predicate(v, index++)) return v
    }
    return undefined
  } else {
    // Object
    for (const k in collection) {
      if (predicate(collection[k], k)) return collection[k]
    }
    return undefined
  }
}
