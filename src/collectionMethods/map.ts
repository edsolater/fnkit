import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj } from "../typings"
import { toIterable } from "./iterableUtils"

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
 * 映射集合元素，大集合自动惰性处理
 * Map collection elements with automatic lazy evaluation for large collections
 *
 * @param collection - 集合（Array/Set/Map/Object/Iterable） / Collection to map
 * @param mapper - 映射函数 (value, key) => newValue / Mapper function
 * @returns 相同类型的新集合 / New collection of the same type
 *
 * @example 数组映射（Array mapping）
 * map([1, 2, 3], v => v * 2) // [2, 4, 6]
 *
 * @example Set 映射（Set mapping）
 * map(new Set([1, 2, 3]), v => v * 2) // Set { 2, 4, 6 }
 *
 * @example Map 映射（Map mapping）
 * map(new Map([['a', 1], ['b', 2]]), v => v * 2) // Map { 'a' => 2, 'b' => 4 }
 *
 * @example 对象映射（Object mapping）
 * map({ a: 1, b: 2 }, v => v * 2) // { a: 2, b: 4 }
 */
export function map<T, R>(collection: T[], mapper: (value: T, index: number) => R): R[]
export function map<T, R>(collection: Set<T>, mapper: (value: T, index: number) => R): Set<R>
export function map<K, V, R>(collection: Map<K, V>, mapper: (value: V, key: K) => R): Map<K, R>
export function map<T, R>(collection: Iterable<T>, mapper: (value: T, index: number) => R): IterableIterator<R>
export function map<T extends AnyObj, R>(
  collection: T,
  mapper: (value: T[keyof T], key: string) => R,
): { [K in keyof T]: R }
export function map(collection: any, mapper: any): any {
  if (isArray(collection)) {
    return mapArray(collection, mapper)
  } else if (isSet(collection)) {
    return mapSet(collection, mapper)
  } else if (isMap(collection)) {
    return mapMap(collection, mapper)
  } else if (isIterable(collection)) {
    return toIterable(collection).map(mapper)
  } else {
    return mapObject(collection, mapper)
  }
}

/**
 * 映射数组，大数组惰性处理
 * Map array with lazy evaluation for large arrays
 */
function mapArray<T, R>(arr: T[], mapper: (value: T, index: number) => R): R[] {
  if (arr.length < LAZY_THRESHOLD.array) {
    return arr.map(mapper)
  }

  let cached: R[] | null = null
  const compute = () => {
    if (!cached) cached = arr.map(mapper)
    return cached
  }

  return new Proxy([] as R[], {
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
 * 映射 Set，大集合惰性处理
 * Map Set with lazy evaluation for large sets
 */
function mapSet<T, R>(set: Set<T>, mapper: (value: T, index: number) => R): Set<R> {
  if (set.size < LAZY_THRESHOLD.set) {
    const result = new Set<R>()
    let index = 0
    for (const v of set) {
      result.add(mapper(v, index++))
    }
    return result
  }

  let cached: Set<R> | null = null
  const compute = () => {
    if (!cached) {
      cached = new Set<R>()
      let index = 0
      for (const v of set) {
        cached.add(mapper(v, index++))
      }
    }
    return cached
  }

  return new Proxy(new Set<R>(), {
    get(target, prop) {
      const value = Reflect.get(compute(), prop)
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
 * 映射 Map，大集合惰性处理
 * Map Map with lazy evaluation for large maps
 */
function mapMap<K, V, R>(map: Map<K, V>, mapper: (value: V, key: K) => R): Map<K, R> {
  if (map.size < LAZY_THRESHOLD.map) {
    const result = new Map<K, R>()
    for (const [k, v] of map) {
      result.set(k, mapper(v, k))
    }
    return result
  }

  let cached: Map<K, R> | null = null
  const compute = () => {
    if (!cached) {
      cached = new Map<K, R>()
      for (const [k, v] of map) {
        cached.set(k, mapper(v, k))
      }
    }
    return cached
  }

  return new Proxy(new Map<K, R>(), {
    get(target, prop) {
      const value = Reflect.get(compute(), prop)
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
 * 映射对象，大对象惰性处理
 * Map object with lazy evaluation for large objects
 */
function mapObject<T extends AnyObj, R>(obj: T, mapper: (value: any, key: string) => R): { [K in keyof T]: R } {
  const keys = Object.keys(obj)
  if (keys.length < LAZY_THRESHOLD.object) {
    const result: AnyObj = {}
    for (const k in obj) {
      result[k] = mapper(obj[k], k)
    }
    return result as { [K in keyof T]: R }
  }

  let cached: AnyObj | null = null
  const compute = () => {
    if (!cached) {
      cached = {}
      for (const k in obj) {
        cached[k] = mapper(obj[k], k)
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
  }) as { [K in keyof T]: R }
}
