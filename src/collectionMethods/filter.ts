import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"
import type { Collection, GetCollectionKey, GetCollectionValue } from "./type"

/**
 * 惰性执行阈值
 * Lazy execution thresholds
 */
const LAZY_THRESHOLD = {
  array: 100,
  set: 100,
  map: 50,
  object: 50,
}

/**
 * 过滤集合元素，大集合自动惰性处理
 * Filter collection elements with automatic lazy evaluation for large collections
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to filter
 * @param predicate - 断言函数 (value, key) => boolean / Predicate function
 * @returns 相同类型的新集合 / New collection of the same type
 *
 * @example 数组过滤（Array filtering）
 * filter([1, 2, 3], v => v > 1) // [2, 3]
 *
 * @example Set 过滤（Set filtering）
 * filter(new Set([1, 2, 3]), v => v > 1) // Set { 2, 3 }
 *
 * @example Map 过滤（Map filtering）
 * filter(new Map([['a', 1], ['b', 2]]), v => v > 1) // Map { 'b' => 2 }
 *
 * @example 对象过滤（Object filtering）
 * filter({ a: 1, b: 2 }, v => v > 1) // { b: 2 }
 *
 * @example Iterable 过滤（uses iterator helper）
 * filter(someIterable, v => v > 1) // IterableIterator
 */
export function filter<V>(collection: V[], predicate: (value: V, index: number) => unknown): V[]
export function filter<V>(collection: Set<V>, predicate: (value: V, index: number) => unknown): Set<V>
export function filter<K, V>(collection: Map<K, V>, predicate: (value: V, key: K) => unknown): Map<K, V>
export function filter<V>(collection: Iterable<V>, predicate: (value: V, index: number) => unknown): IterableIterator<V>
export function filter<O extends AnyObj>(
  collection: O,
  predicate: (value: O[keyof O], key: string) => unknown,
): Partial<O>
export function filter(collection: any, predicate: any): any {
  if (isArray(collection)) {
    return filterArray(collection, predicate)
  } else if (isSet(collection)) {
    return filterSet(collection, predicate)
  } else if (isMap(collection)) {
    return filterMap(collection, predicate)
  } else if (isIterable(collection)) {
    // 使用 iterator helper
    // Use iterator helper
    const iterator = collection[Symbol.iterator]()
    let index = 0
    return {
      [Symbol.iterator]() {
        return this
      },
      next() {
        while (true) {
          const { value, done } = iterator.next()
          if (done) return { value: undefined, done: true }
          if (predicate(value, index++)) {
            return { value, done: false }
          }
        }
      },
    } as IterableIterator<any>
  } else {
    return filterObject(collection, predicate)
  }
}

/**
 * 过滤数组，大数组惰性处理
 * Filter array with lazy evaluation for large arrays
 */
function filterArray<T>(arr: T[], predicate: (value: T, index: number) => boolean): T[] {
  if (arr.length < LAZY_THRESHOLD.array) {
    return arr.filter(predicate)
  }

  let cached: T[] | null = null
  const compute = () => {
    if (!cached) {
      cached = arr.filter(predicate)
    }
    return cached
  }

  return new Proxy([] as T[], {
    get(target, prop) {
      return Reflect.get(compute(), prop)
    },
    has(target, prop) {
      return Reflect.has(compute(), prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(compute())
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(compute(), prop)
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(compute())
    },
  })
}

/**
 * 过滤 Set，大集合惰性处理
 * Filter Set with lazy evaluation for large sets
 */
function filterSet<T>(set: Set<T>, predicate: (value: T, index: number) => boolean): Set<T> {
  if (set.size < LAZY_THRESHOLD.set) {
    const result = new Set<T>()
    let index = 0
    for (const v of set) {
      if (predicate(v, index++)) {
        result.add(v)
      }
    }
    return result
  }

  let cached: Set<T> | null = null
  const compute = () => {
    if (!cached) {
      cached = new Set<T>()
      let index = 0
      for (const v of set) {
        if (predicate(v, index++)) {
          cached.add(v)
        }
      }
    }
    return cached
  }

  return new Proxy(new Set<T>(), {
    get(target, prop) {
      const value = Reflect.get(compute(), prop)
      // 绑定方法的 this 到真实 Set
      // Bind method's this to real Set
      if (typeof value === "function") {
        return value.bind(compute())
      }
      return value
    },
    has(target, prop) {
      return Reflect.has(compute(), prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(compute())
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(compute(), prop)
    },
  })
}

/**
 * 过滤 Map，大集合惰性处理
 * Filter Map with lazy evaluation for large maps
 */
function filterMap<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean): Map<K, V> {
  if (map.size < LAZY_THRESHOLD.map) {
    const result = new Map<K, V>()
    for (const [k, v] of map) {
      if (predicate(v, k)) {
        result.set(k, v)
      }
    }
    return result
  }

  let cached: Map<K, V> | null = null
  const compute = () => {
    if (!cached) {
      cached = new Map<K, V>()
      for (const [k, v] of map) {
        if (predicate(v, k)) {
          cached.set(k, v)
        }
      }
    }
    return cached
  }

  return new Proxy(new Map<K, V>(), {
    get(target, prop) {
      const value = Reflect.get(compute(), prop)
      // 绑定方法的 this 到真实 Map
      // Bind method's this to real Map
      if (typeof value === "function") {
        return value.bind(compute())
      }
      return value
    },
    has(target, prop) {
      return Reflect.has(compute(), prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(compute())
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(compute(), prop)
    },
  })
}

/**
 * 过滤对象，大对象惰性处理
 * Filter object with lazy evaluation for large objects
 */
function filterObject<T extends AnyObj>(obj: T, predicate: (value: any, key: string) => boolean): Partial<T> {
  const keys = Object.keys(obj)
  if (keys.length < LAZY_THRESHOLD.object) {
    const result: AnyObj = {}
    for (const k in obj) {
      if (predicate(obj[k], k)) {
        result[k] = obj[k]
      }
    }
    return result as Partial<T>
  }

  let cached: AnyObj | null = null
  const compute = () => {
    if (!cached) {
      cached = {}
      for (const k in obj) {
        if (predicate(obj[k], k)) {
          cached[k] = obj[k]
        }
      }
    }
    return cached
  }

  return new Proxy({} as AnyObj, {
    get(target, prop) {
      return Reflect.get(compute(), prop)
    },
    has(target, prop) {
      return Reflect.has(compute(), prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(compute())
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(compute(), prop)
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(compute())
    },
  }) as Partial<T>
}
