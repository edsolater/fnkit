import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"

/**
 * 归约集合为单个值，必须遍历全部（不需要惰性）
 * Reduce collection to a single value, must iterate all (no lazy needed)
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to reduce
 * @param reducer - 归约函数 (acc, value, key) => newAcc / Reducer function
 * @param initialValue - 初始值 / Initial value
 * @returns 归约结果 / Reduced result
 *
 * @example 数组归约（Array reduce）
 * reduce([1, 2, 3], (acc, v) => acc + v, 0) // 6
 *
 * @example Set 归约（Set reduce）
 * reduce(new Set([1, 2, 3]), (acc, v) => acc + v, 0) // 6
 *
 * @example Map 归约（Map reduce）
 * reduce(new Map([['a', 1], ['b', 2]]), (acc, v) => acc + v, 0) // 3
 *
 * @example 对象归约（Object reduce）
 * reduce({ a: 1, b: 2 }, (acc, v) => acc + v, 0) // 3
 */
export function reduce<T, R>(arr: T[], reducer: (acc: R, value: T, index: number) => R, initialValue: R): R
export function reduce<T, R>(set: Set<T>, reducer: (acc: R, value: T, index: number) => R, initialValue: R): R
export function reduce<K, V, R>(map: Map<K, V>, reducer: (acc: R, value: V, key: K) => R, initialValue: R): R
export function reduce<T, R>(
  iterable: Iterable<T>,
  reducer: (acc: R, value: T, index: number) => R,
  initialValue: R,
): R
export function reduce<T extends AnyObj, R>(
  obj: T,
  reducer: (acc: R, value: T[keyof T], key: string) => R,
  initialValue: R,
): R
export function reduce(collection: any, reducer: any, initialValue: any): any {
  if (isArray(collection)) {
    return collection.reduce(reducer, initialValue)
  } else if (isSet(collection)) {
    let acc = initialValue
    let index = 0
    for (const v of collection) {
      acc = reducer(acc, v, index++)
    }
    return acc
  } else if (isMap(collection)) {
    let acc = initialValue
    for (const [k, v] of collection) {
      acc = reducer(acc, v, k)
    }
    return acc
  } else if (isIterable(collection)) {
    let acc = initialValue
    let index = 0
    for (const v of collection) {
      acc = reducer(acc, v, index++)
    }
    return acc
  } else {
    // Object
    let acc = initialValue
    for (const k in collection) {
      acc = reducer(acc, collection[k], k)
    }
    return acc
  }
}
