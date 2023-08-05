import { unifyItem } from './collectionMethods'

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

export function mergeObjectCoverly<T extends object>(objs: T[]): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!
  return new Proxy(createEmptyObjectByOlds(objs), {
    get(target, key, receiver) {
      return getValue(objs, key, ({ valueA, valueB }) => valueB ?? valueA)
    }
  }) as T
}

function createEmptyObjectByOlds(objs: object[]) {
  return objs.reduce((acc, cur) => Object.assign(acc, Object.getOwnPropertyDescriptors(cur)), {})
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
