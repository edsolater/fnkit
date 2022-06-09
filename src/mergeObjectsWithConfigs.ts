import { ObjectNotArray } from './typings/constants'

/**
 * （这只是个基础框架，没多少实用价值，需要包装成更强的函数）（**只是**浅复制了一层）
 * 合并多个对象(shallow 浅复制)
 * 不考虑不可迭代的属性
 * @example
 * _mergeObjects([{a: 3, b: 2}, {a: 1, b: 3}], (key, v1, v2) => (key === 'a') ? [v1, v2] : v2) // {a: [3,1], b: 3}
 */
export default function mergeObjectsWithConfigs<T extends ObjectNotArray>(
  objs: T[],
  transformer: (payloads: { key: string; valueA: any; valueB: any; objA: T; objB: T }) => any
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]!

  return objs.reduce((acc, obj) => {
    Object.entries(obj).forEach(([key, valueB]) => {
      Reflect.set(acc, key, transformer({ key, valueA: acc[key], valueB, objA: acc, objB: obj }))
    })
    return acc
  }, {} as T)
}
