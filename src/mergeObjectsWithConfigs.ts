import { unifyItem } from './collectionMethods'
import { AnyObj } from './typings'

/**
 * merge without access, you can config transformer for detail control
 * @example
 * mergeObjectsWithConfigs([{a: 3, b: 2}, {a: 1, b: 3}], (key, v1, v2) => (key === 'a') ? [v1, v2] : v2) // {a: [3,1], b: 3}
 */
export function mergeObjectsWithConfigs<T extends object>(
  objs: T[],
  transformer: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!
  // TODO: maybe proxy can deep fake without createEmptyObjectByOlds
  return new Proxy(createEmptyObjectByOlds(objs), {
    get(target, key, receiver) {
      return getValue(objs, key, transformer)
    }
  }) as T
}


/**
 * pure merge object with proxy
 * @param objs target objects
 * @example
 * mergeObjects({a: 3, b: 2}, {a: 1, b: 3}) // {a: 1, b: 3}
 */
export function mergeObjects<T, W>(...objs: [T, W]): T & W
export function mergeObjects<T, W, X>(...objs: [T, W, X]): T & W & X
export function mergeObjects<T, W, X, Y>(...objs: [T, W, X, Y]): T & W & X & Y
export function mergeObjects<T, W, X, Y, Z>(...objs: [T, W, X, Y, Z]): T & W & X & Y & Z
export function mergeObjects<T extends AnyObj>(...objs: T[]): T
export function mergeObjects<T extends object>(...objs: T[]): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]! ?? {}
  const reversedObjs = [...objs].reverse()
  return new Proxy(createEmptyObjectByOlds(objs), {
    get(target, key, receiver) {
      for (const obj of reversedObjs) {
        if (key in obj) {
          const v = obj[key]
          if (v !== undefined) {
            return v
          }
        }
      }
    }
  }) as T
}

function createEmptyObjectByOlds(objs: object[]) {
  return objs.reduce((acc, cur) => (cur ? Object.assign(acc, Object.getOwnPropertyDescriptors(cur)) : acc), {})
}

function getValue<T extends object>(
  objs: T[],
  key: string | symbol,
  valueMatchRule: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any
) {
  return objs.reduce((valueA, obj) => {
    const valueB = obj[key]
    const mergedValue = valueA != null && valueB !== null ? valueMatchRule({ key, valueA, valueB }) : valueB ?? valueA
    return mergedValue
  }, undefined)
}

function getObjKey<T extends object>(objs: T[]) {
  return unifyItem(objs.flatMap((obj) => Reflect.ownKeys(obj)))
}
