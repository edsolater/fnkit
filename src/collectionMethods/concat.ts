import { isArray, isIterable } from "../dataType"
import { AnyObj } from "../typings"

/**
 * 惰性执行阈值
 * Lazy execution thresholds
 */
const LAZY_THRESHOLD = {
  array: 100,
}

/**
 * 合并两个相同类型的集合，返回新集合
 * Concatenate two collections of the same type and return a new collection
 *
 * 支持数组、Set、Map、对象和可迭代对象，两个参数类型必须相同
 * Supports arrays, Sets, Maps, objects and iterables. Both parameters must be of the same type.
 *
 * @param collection1 - 第一个集合 / First collection
 * @param collection2 - 第二个集合 / Second collection
 * @returns 合并后的新集合 / New merged collection
 *
 * @example 数组合并（array concatenation）
 * concat([1, 2, 3], [4, 5]) // [1, 2, 3, 4, 5]
 *
 * @example Set合并（set union）
 * concat(new Set([1, 2]), new Set([2, 3])) // Set(3) {1, 2, 3}
 *
 * @example Map合并（map merge）
 * concat(new Map([['a', 1]]), new Map([['b', 2]])) // Map(2) {'a' => 1, 'b' => 2}
 *
 * @example 对象合并（object merge）
 * concat({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
 *
 * @example 可迭代对象合并（iterable concatenation）
 * const iter1 = (function*() { yield 1; yield 2 })()
 * const iter2 = (function*() { yield 3; yield 4 })()
 * concat(iter1, iter2) // IterableIterator yielding 1, 2, 3, 4
 */
export function concat<T>(arr1: T[], arr2: T[]): T[]
export function concat<T>(set1: Set<T>, set2: Set<T>): Set<T>
export function concat<K, V>(map1: Map<K, V>, map2: Map<K, V>): Map<K, V>
export function concat<T>(iter1: Iterable<T>, iter2: Iterable<T>): IterableIterator<T>
export function concat<T extends AnyObj, D extends AnyObj>(obj1: T, obj2: D): T & D
export function concat(collection, collection2) {
  // 数组
  if (isArray(collection) && isArray(collection2)) {
    const totalLength = collection.length + collection2.length
    
    // 小数组直接合并
    if (totalLength < LAZY_THRESHOLD.array) {
      return collection.concat(collection2)
    }
    
    // 大数组惰性合并
    let cached: any[] | null = null
    const compute = () => {
      if (!cached) {
        cached = collection.concat(collection2)
      }
      return cached
    }
    
    return new Proxy([] as any[], {
      get(target, prop) {
        const value = Reflect.get(compute(), prop)
        if (typeof value === 'function') return value.bind(compute())
        return value
      },
      has(target, prop) { return Reflect.has(compute(), prop) },
      ownKeys(target) { return Reflect.ownKeys(compute()) },
      getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(compute(), prop) },
      getPrototypeOf(target) { return Reflect.getPrototypeOf(compute()) },
    })
  }
  
  // Set
  if (collection instanceof Set && collection2 instanceof Set) {
    return new Set([...collection, ...collection2])
  }
  
  // Map
  if (collection instanceof Map && collection2 instanceof Map) {
    return new Map([...collection, ...collection2])
  }
  
  // 可迭代对象（已经是惰性的）
  if (isIterable(collection) && isIterable(collection2)) {
    return (function* () {
      for (const item of collection) {
        yield item
      }
      for (const item of collection2) {
        yield item
      }
    })()
  }
  
  // 对象
  return { ...collection, ...collection2 }
}