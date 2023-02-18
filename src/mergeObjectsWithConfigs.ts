import { unified } from './collectionMethods'

/**
 * （这只是个基础框架，没多少实用价值，需要包装成更强的函数）（**只是**浅复制了一层）
 * 合并多个对象(shallow 浅复制)
 * 不考虑不可迭代的属性
 * @example
 * _mergeObjects([{a: 3, b: 2}, {a: 1, b: 3}], (key, v1, v2) => (key === 'a') ? [v1, v2] : v2) // {a: [3,1], b: 3}
 */
export function mergeObjectsWithConfigs<T extends object>(
  objs: T[],
  transformer: (payloads: { key: string | symbol; valueA: any; valueB: any }) => any
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!

  return Object.defineProperties(
    {},
    getObjKey(objs).reduce((acc, key) => {
      acc[key] = {
        enumerable: true,
        get() {
          return getValue(objs, key, transformer)
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
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
  return unified(objs.flatMap((obj) => Reflect.ownKeys(obj)))
}
