import { isFunction } from "."
import type { AnyFn } from "./typings"

/**
 * 读取数据时， 才会 merge 地看问题
 * 
 * 【工具的工具】
 *  
 * @example
 * shallowMergeObjectWithConfig(
 *   [{ a: 3, b: 2 }, { a: 1, b: 3 }],
 *   ({ key, values }) => (key === "a" ? values : values.at(-1)),
 * ) // { a: [3, 1], b: 3 }
 */
export function shallowMergeObjectWithConfig<T extends object | Function>(
  objs: T[],
  transformer: (payloads: { key: string | symbol; values: any[] }) => any = ({ values }) => values.at(-1),
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!

  // ----- 内部属性 -----
  let _keySet: Set<string | symbol> | undefined = undefined

  // ------ 内部方法 -----
  function _getKeys() {
    if (!_keySet) {
      _keySet = getKeySet(objs)
    }
    return _keySet
  }

  // ------ 返回 Proxy -----
  return new Proxy(objs.some(isFunction) ? () => {} : {}, {
    apply(_target, thisArg, argArray) {
      const fn = objs.findLast(isFunction)
      return fn && Reflect.apply(fn as AnyFn, thisArg, argArray)
    },
    get: (target, key) =>
      _getKeys().has(key)
        ? key in target
          ? target[key]
          : transformer({
              key,
              values: getValues(objs, key),
            })
        : undefined,
    set: (_target, key, value) => Reflect.set(_target, key, value),
    has: (_target, key) => _getKeys().has(key),
    getPrototypeOf: () => (objs[0] ? Object.getPrototypeOf(objs[0]) : null),
    ownKeys: () => Array.from(_getKeys()),
    // for Object.keys to filter
    getOwnPropertyDescriptor: (_target, prop) => {
      for (const obj of objs) {
        if (prop in obj) {
          return Reflect.getOwnPropertyDescriptor(obj, prop)
        }
      }
    },
  }) as T
}

/** 获取对象组的某个key下的所有值 */
export function getValues<T extends object>(objs: T[], key: string | symbol) {
  const results: any[] = []
  for (const obj of objs) {
    if (obj == null) continue
    if (!(key in obj)) continue
    const value = obj[key]
    results.push(value)
  }
  return results
}

export function getKeys<T extends object | undefined>(objs: T[]) {
  if (objs.length <= 1) {
    const obj = objs[0]
    return obj ? Reflect.ownKeys(obj) : []
  }

  const result = new Set<string | symbol>()
  for (const obj of objs) {
    if (!obj) continue
    Reflect.ownKeys(obj).forEach((k) => result.add(k))
  }
  return Array.from(result)
}

export function getKeySet<T extends object | undefined>(objs: T[]): Set<string | symbol> {
  if (objs.length <= 1) {
    const obj = objs[0]
    return obj ? new Set(Reflect.ownKeys(obj)) : new Set()
  }

  const result = new Set<string | symbol>()
  for (const obj of objs) {
    if (!obj) continue
    Reflect.ownKeys(obj).forEach((k) => result.add(k))
  }
  return result
}
