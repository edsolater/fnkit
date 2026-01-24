import { isFunction } from "./dataType"
import { AnyFn } from "./typings"

/**
 * merge without access, you can config transformer for detail control
 * @example
 * mergeObjectsWithConfigs([{a: 3, b: 2}, {a: 1, b: 3}], (key, v1, v2) => (key === 'a') ? [v1, v2] : v2) // {a: [3,1], b: 3}
 */
export function mergeObjectsWithConfigs<T extends object | Function>(
  objs: T[],
  transformer: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any = ({ valueA, valueB }) => valueB,
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!

  // ----- 内部属性 -----
  let _keySet: Set<string | symbol> | undefined = undefined

  // ------ 内部方法 -----
  function _getKeys() {
    if (!_keySet) {
      _keySet = getKeySet(...objs)
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
      _getKeys().has(key) ? (key in target ? target[key] : getValueByConfig(objs, key, transformer)) : undefined,
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

/**
 * 合并对象，但**不访问对象的属性**（使用proxy做到）
 *
 * 返回输入对象的检索入口
 *
 * @param objs 多个对象（但为读取时不会访问其属性）
 * @example
 * mergeObjects({a: 3, b: 2}, {a: 1, b: 3}) // {a: 1, b: 3}
 */
export function mergeObjects<T, W>(...objs: [T, W]): T & W
export function mergeObjects<T, W, X>(...objs: [T, W, X]): T & W & X
export function mergeObjects<T, W, X, Y>(...objs: [T, W, X, Y]): T & W & X & Y
export function mergeObjects<T, W, X, Y, Z>(...objs: [T, W, X, Y, Z]): T & W & X & Y & Z
export function mergeObjects<T extends object>(...objs: T[]): T
export function mergeObjects<T extends object>(...objs: T[]): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]

  // ----- 内部属性 -----
  const containMethods = objs.some(isFunction)// 函数也能作为对象输入
  let keySet: Set<string | symbol> | undefined = undefined

  // ------ 内部方法 -----
  function _getKeys() {
    if (!keySet) {
      keySet = getKeySet(...objs)
    }
    return keySet
  }
  function _getValue(key: string | symbol) {
    for (let i = objs.length - 1; i >= 0; i--) {
      const obj = objs[i]
      if (obj && key in obj) {
        const v = obj[key]
        if (v !== undefined) {
          return v
        }
      }
    }
  }

  // ------ 返回 Proxy -----
  return new Proxy(containMethods ? () => {} : {}, {
    apply(_target, thisArg, argArray) {
      const fn = objs.findLast(isFunction)
      return fn && Reflect.apply(fn as AnyFn, thisArg, argArray)
    },
    get: (target, key) => (_getKeys().has(key) ? (key in target ? target[key] : _getValue(key)) : undefined),
    has: (_target, key) => _getKeys().has(key),
    set: (_target, key, value) => Reflect.set(_target, key, value),
    getPrototypeOf: () => (objs[0] ? Object.getPrototypeOf(objs[0]) : null),
    ownKeys: () => Array.from(_getKeys()),
    // for Object.keys to filter
    getOwnPropertyDescriptor: (_target, prop) => {
      for (const obj of objs) {
        if (obj && prop in obj) {
          return Reflect.getOwnPropertyDescriptor(obj, prop)
        }
      }
    },
  }) as T
}

// test code
// console.time('mergeObjects')
// for (let i = 0; i < 1000000; i++) {
//   const a = mergeObjects({ a: 3, b: 2 }, { a: 1, b: 3 })
// }
// console.timeEnd('mergeObjects')

// console.time('mergeObjects2')
// for (let i = 0; i < 1000000; i++) {
//   const b = { ...{ a: 3, b: 2 }, ...{ a: 1, b: 3 } }
// }
// console.timeEnd('mergeObjects2')

/**
 *
 * @example
 * createEmptyObjectByOlds({a: 3, b: 2}, {a: 1, b: 3, get c() {return 4}}) // {a: undefined, b: undefined, c: undefined}
 * @param objs old object
 * @returns new object with undefined properties
 */
export function createEmptyObjectByOlds(): object
export function createEmptyObjectByOlds<T extends Record<string | symbol, any>>(
  ...objs: [T]
): { [key in keyof T]: undefined }
export function createEmptyObjectByOlds<T extends Record<string | symbol, any>, U extends Record<string | symbol, any>>(
  ...objs: [T, U]
): { [key in keyof T | keyof U]: undefined }
export function createEmptyObjectByOlds<
  T extends Record<string | symbol, any>,
  U extends Record<string | symbol, any>,
  V extends Record<string | symbol, any>,
>(...objs: [T, U, V]): { [key in keyof T | keyof U | keyof V]: undefined }
export function createEmptyObjectByOlds<
  T extends Record<string | symbol, any>,
  U extends Record<string | symbol, any>,
  V extends Record<string | symbol, any>,
  W extends Record<string | symbol, any>,
>(...objs: [T, U, V, W]): { [key in keyof T | keyof U | keyof V | keyof W]: undefined }
export function createEmptyObjectByOlds(...objs: (object | undefined)[]): object
export function createEmptyObjectByOlds(...objs: (object | undefined)[]): any {
  return objs.length > 0 ? createEmptyObject(getKeys(...objs)) : {}
}

/**
 *
 * @param keys specifyed keys (can have duplicated keys)
 * @returns
 */
export function createEmptyObject(keys: (string | symbol)[]) {
  const result = {}
  for (const key of keys) {
    result[key] = undefined
  }
  return result
}

function getValueByConfig<T extends object>(
  objs: T[],
  key: string | symbol,
  valueMatchRule: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any,
) {
  let valueA = undefined
  for (const obj of objs) {
    if (obj == null) continue
    const valueB = obj[key]
    valueA = valueA != null && valueB !== null ? valueMatchRule({ key, valueA, valueB }) : (valueB ?? valueA)
  }
  return valueA
}

export function getKeys<T extends object | undefined>(...objs: T[]) {
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

export function getKeySet<T extends object | undefined>(...objs: T[]): Set<string | symbol> {
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

