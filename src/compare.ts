import { isArray, isObject, isObjectLike, isString } from './dataType'
import { AnyObj } from './typings/constants'
import { MayArray } from './typings/tools'
import { toPrimitiveValue } from './toPrimitiveValue'

/**
 * very rude, just checking keys
 */
export function isKeyInShape(toJudge: AnyObj, shape: AnyObj): boolean {
  const targetKeys = Object.getOwnPropertyNames(toJudge)
  const shapeKeys = Object.getOwnPropertyNames(shape)
  return shapeKeys.every((shapeKey) => targetKeys.includes(shapeKey))
}

/**
 * @example
 * isPartOf({a: 'hello'}, { a: 'hello', b: 'world'}) //=> true
 */
export function isPartOf(toJudge: AnyObj, whole: AnyObj, options?: { ignoreValueCase?: boolean }): boolean {
  return Object.entries(toJudge).every(([key, value]) => {
    if (options?.ignoreValueCase && isString(whole[key]) && isString(value)) {
      return whole[key].toLowerCase() === value.toLowerCase()
    }
    return whole[key] === value
  })
}

// it type is not intelligent enough
export function hasProperty<T, K extends keyof T | string | symbol>(obj: T, key: MayArray<K>): boolean {
  return isObject(obj) && [key].flat().every((objKey) => Reflect.has(obj as any, objKey))
}

/**
 * 检测两个值（一般复杂对象字面量）（内部只包括基本值、数组、对象字面量）是否值相同
 * @param val1 一个复合值
 * @param val2 另一个复合值
 * @example
 * areDeepEqual([1, 2], [1, 2]) // true
 * areDeepEqual({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2, d: 3 } }) // true
 */
export function areDeepEqual(val1: unknown, val2: unknown) {
  if (areSame(val1, val2)) return true
  if ((isObject(val1) && isObject(val2)) || (isArray(val1) && isArray(val2))) {
    return haveSameKeys(val1, val2) ? Object.getOwnPropertyNames(val1).every((key) => areDeepEqual(val1[key], val2[key])) : false
  }
  return false
}

/**
 * 判断两个数组是否长度相同
 * @param arr1 一个数组
 * @param arr2 另一个数组
 */
export function areLengthEqual(arr1: unknown[], arr2: unknown[]) {
  return arr1.length === arr2.length
}

/**
 * 判断多个值（至少两个）全等
 * @param vals 要判断的值
 */
export function areSame(...vals: unknown[]): boolean {
  if (vals.length < 2) return false
  for (let i = 1; i < vals.length; i++) {
    const pre = vals[i - 1]
    const cur = vals[i]
    if (!Object.is(pre, cur)) return false
  }
  return true
}

/**
 * /**
 * 检测两个值（一般复杂对象字面量）是否值相同（浅比较）
 * @param val1 被比较的值
 * @param val2 匹配的目标值
 * @example
 * areDeepEqual([1, 2], [1, 2]) // true
 * areDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }) // true
 * areDeepEqual({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2, d: 3 } }) // false
 */
export function areShallowEqual(val1: unknown, val2: unknown) {
  return isObjectLike(val1) && isObjectLike(val2)
    ? areShallowEqualArray(Object.entries(val1).flat(), Object.entries(val2).flat())
    : areSame(val1, val2)
}

/**
 * 判断两个数组是否具有相同（浅比较）
 * @param arr1 被比较
 * @param arr2 期望目标
 * @example
 * areEqualArray([1, 2], [1, 2]) // true
 */
export function areShallowEqualArray(arr1: unknown[], arr2: unknown[]) {
  if (!areLengthEqual(arr1, arr2)) return false
  return arr1.every((i, idx) => i === arr2[idx])
}

/**
 * 判断两个对象是否值相同（浅比较）
 * @param obj1 被比较的对象
 * @param obj2 期望目标
 * @example
 * areShallowEqualObject([1, 2], [1, 2]) // true
 * areShallowEqualObject({ a: 1 }, { a: 1 }) // true
 */
export function areShallowEqualObject(obj1: object, obj2: object) {
  return areShallowEqualArray(Object.entries(obj1).flat(), Object.entries(obj2).flat())
}

export function hasItem<T>(arr: T[], item: T) {
  return isMemberOf(arr, item)
}

export function hasKey<T extends object>(obj: T, key: keyof T) {
  //@ts-ignore
  return isItemOf(key, Object.getOwnPropertyNames(obj))
}

/**
 * 判断两个对象是否具有相同的键
 * @param val1 被比较
 * @param val2 期望目标
 * @example
 * haveEqualKeys({ a: 1, b: 2, c: 3 }, { a: 7, b: 8, c: 9 }) // true
 */
export function haveSameKeys(val1: unknown, val2: unknown) {
  return Boolean(isObjectLike(val1) && isObjectLike(val2) && areShallowEqualArray(Object.getOwnPropertyNames(val1), Object.getOwnPropertyNames(val2)))
}

/**
 * object will be JSON.stringify
 * @requires {@link toPrimitiveValue}
 * @example
 * console.log(inArray(2, [1, 2, 3])) // true
 * console.log(inArray(['a', 1], [['a', 1], ['b', 2]])) // true
 */
export const inArray = <T extends unknown>(arr: T[], testVal: any): testVal is T => {
  return arr.map(toPrimitiveValue).includes(toPrimitiveValue(testVal))
}

export function inEnum<T>(detectValue: unknown, arr: ReadonlyArray<T>): detectValue is T {
  //@ts-ignore
  return inArray(arr, detectValue)
}

/**
 * (纯函数)
 * 检测目标数是否落在指定范围内
 * @param n 目标数
 * @param range 范围
 * @example
 * inRange(4, [3, 6]) // true
 * inRange(4, [6, 3]) // true
 * inRange(4, [4, 6]) // true
 * inRange(4, [4, 4]) // true
 * inRange(4, [4.1, 5]) // true
 */
export function inRange(n: number, range: [left: number, right: number]): boolean {
  return range[0] <= n && n <= range[1]
}

export const isMemberOf = inArray
