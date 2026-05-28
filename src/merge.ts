import { every, isObjectLiteral } from "."
import { isArray, isFunction } from "./dataType"
import { shallowMergeObjectWithConfig } from "./mergeObject"
import { AnyArr, AnyFn, AnyObj } from "./typings/baseTypes"

/**
 * 只是 {@link createMerge} 的默认值形态
 * auto-deep
 *
 * @example
 * const mergedList = merge([0, 1, 2], ["hello", "world"])
 * mergedList // [0, 1, 2, "hello", "world"]
 *
 * @example
 * const mergedObject = merge({ a: 3, b: 2 }, { a: 1, c: 3 })
 * mergedObject // { a: 1, b: 2, c: 3 }
 *
 * @example
 * const mergedFn = merge((n: number) => 3 + n, (n: number) => 4 * n, () => 5)
 * mergedFn(2) // [5, 8, 5]
 *
 * @example
 * const mergedNestedObject = merge({ a: ["world"], b: 2, c: 1 }, { a: ["hello"], c: 3 }, { c: [10] })
 * mergedNestedObject // { a: ["world", "hello"], b: 2, c: [10] }
 * @version 0.0.1
 */
export function merge<T extends AnyArr>(...values: T[]): Array<T[number]>
export function merge<T extends AnyFn>(...values: T[]): (...params: Parameters<T>) => ReturnType<T>[]
export function merge<T extends AnyObj>(...values: T[]): T
export function merge<T>(...values: T[]): unknown[]
export function merge<T>(...values: T[]): any {
  return mergeWithConfig(values, ({ values }) => {
    if (every(values, isArray)) return values.flat()
    if (every(values, isFunction))
      return (...args) => values.reduce((returnResults, fn) => returnResults.concat(fn(...args)), [])
    return values.at(-1)
  })
}

/**
 * merge给人的直觉是服务于多个object的，
 * 但config明确， 则也能用于其他数据结构的合并操作
 * 只有纯对象字面量会继续递归合并，其他对象会直接交给configFn处理
 *
 * 未指定同key时的规则， 则只是单纯的覆盖（即取最后一个）
 * @example
 * mergeWithConfig([[0, 1, 2], ["hello", "world"]], ({ values }) => values.flat())
 * // [0, 1, 2, "hello", "world"]
 *
 * @example
 * mergeWithConfig(
 *   [{ foo: [0, 1, 2], bar: 1 }, { foo: ["hello", "world"], bar: 2 }],
 *   ({ key, values }) => (key === "foo" ? values.flat() : values.at(-1)),
 * )
 * // { foo: [0, 1, 2, "hello", "world"], bar: 2 }
 */
export function mergeWithConfig(
  values: any[],
  configFn: (payload: {
    key: keyof any | "$root"
    values: any[] /* 合成时遇到什么是什么？ */
  }) => /* mergedValue */ unknown = ({ values }) => values.at(-1),
  _currentKey: keyof any = "$root", // 当前根节点的key， 主要是内部为了递归时使用，
): any {
  if (values.length === 0) return undefined
  if (values.length === 1) return values[0]

  const shouldRecurseObject = every(values, (value) => isObjectLiteral(value))
  if (!shouldRecurseObject) {
    return configFn({ key: _currentKey, values })
  } else {
    return shallowMergeObjectWithConfig(values, ({ key, values }) => mergeWithConfig(values, configFn, key))
  }
}
