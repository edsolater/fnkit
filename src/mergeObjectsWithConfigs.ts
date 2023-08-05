import { unifyItem } from './collectionMethods'
import { createObjectByGetters } from './createObjectByGetters';

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
  return createObjectByGetters(
    Object.fromEntries(getObjKey(objs).map((key) => [key, () => getValue(objs, key, transformer)]))
  ) as T
}

function getValue<T extends object>(
  objs: T[],
  key: string | symbol,
  valueMatchRule: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any
) {
  return objs.map((o) => o[key]).reduce((valueA, valueB) => valueMatchRule({ key, valueA, valueB }), undefined)
}

function getObjKey<T extends object>(objs: T[]) {
  return unifyItem(objs.flatMap((obj) => Reflect.ownKeys(obj)))
}

