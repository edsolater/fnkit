import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"

/**
 * 检查是否至少有一个元素匹配，短路求值（不需要惰性）
 * Check if at least one element matches with short-circuit evaluation (no lazy needed)
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to check
 * @param predicate - 断言函数 (value, key) => boolean / Predicate function
 * @returns 是否有匹配元素 / Whether any element matches
 *
 * @example 数组检查（Array some）
 * some([1, 2, 3], v => v > 2) // true
 *
 * @example Set 检查（Set some）
 * some(new Set([1, 2, 3]), v => v > 2) // true
 *
 * @example Map 检查（Map some）
 * some(new Map([['a', 1], ['b', 2]]), v => v > 1) // true
 *
 * @example 对象检查（Object some）
 * some({ a: 1, b: 2 }, v => v > 1) // true
 */
export function some<T>(arr: T[], predicate: (value: T, index: number) => unknown): boolean
export function some<T>(set: Set<T>, predicate: (value: T, index: number) => unknown): boolean
export function some<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => unknown): boolean
export function some<T>(iterable: Iterable<T>, predicate: (value: T, index: number) => unknown): boolean
export function some<T extends AnyObj>(obj: T, predicate: (value: T[keyof T], key: string) => unknown): boolean
export function some(collection: any, predicate: any): boolean {
  if (isArray(collection)) {
    return collection.some(predicate)
  } else if (isSet(collection)) {
    let index = 0
    for (const v of collection) {
      if (predicate(v, index++)) return true
    }
    return false
  } else if (isMap(collection)) {
    for (const [k, v] of collection) {
      if (predicate(v, k)) return true
    }
    return false
  } else if (isIterable(collection)) {
    let index = 0
    for (const v of collection) {
      if (predicate(v, index++)) return true
    }
    return false
  } else {
    // Object
    for (const k in collection) {
      if (predicate(collection[k], k)) return true
    }
    return false
  }
}
