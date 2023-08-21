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
export function mergeObjects<T extends AnyObj | undefined>(...objs: T[]): T
export function mergeObjects<T extends object | undefined>(...objs: T[]): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]! ?? {}
  const reversedObjs = [...objs].reverse()
  return new Proxy(createEmptyObjectByOlds(...objs), {
    get(target, key, receiver) {
      for (const obj of reversedObjs) {
        if (obj && key in obj) {
          const v = obj[key]
          if (v !== undefined) {
            return v
          }
        }
      }
    }
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
export function createEmptyObjectByOlds<
  T extends Record<string | symbol, any>,
  U extends Record<string | symbol, any>
>(...objs: [T, U]): { [key in keyof T | keyof U]: undefined }
export function createEmptyObjectByOlds<
  T extends Record<string | symbol, any>,
  U extends Record<string | symbol, any>,
  V extends Record<string | symbol, any>
>(...objs: [T, U, V]): { [key in keyof T | keyof U | keyof V]: undefined }
export function createEmptyObjectByOlds<
  T extends Record<string | symbol, any>,
  U extends Record<string | symbol, any>,
  V extends Record<string | symbol, any>,
  W extends Record<string | symbol, any>
>(...objs: [T, U, V, W]): { [key in keyof T | keyof U | keyof V | keyof W]: undefined }
export function createEmptyObjectByOlds(...objs: (object | undefined)[]): object
export function createEmptyObjectByOlds(...objs: (object | undefined)[]): any {
  return objs.length ? createEmptyObject(getObjKey(objs)) : {}
}

/**
 *
 * @param keys specifyed keys (can have duplicated keys)
 * @returns
 */
export function createEmptyObject(keys: (string | symbol)[]) {
  return keys.reduce((acc, cur) => {
    acc[cur] = undefined
    return acc
  }, {} as Record<string | symbol, any>)
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

function getObjKey<T extends object | undefined>(objs: T[]) {
  return objs.reduce((acc, cur) => {
    if (cur) {
      // @ts-expect-error no need worry about type
      acc.push(...Object.keys(cur))
    }
    return acc
  }, []) as string[]
}
