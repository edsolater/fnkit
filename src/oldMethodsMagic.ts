import { isFunction } from './dataType'
import shrinkToValue from './wrapper/shrinkToValue'
import { getLastItem } from './oldMethodsArray'
import { Primitive, NotFunctionValue } from './typings/constants'

export function assert(condition: any, msg?: string, callback?: (msg?: string) => void): asserts condition {
  if (!condition) {
    callback?.(msg)
    throw new Error(msg)
  }
}

export const neww = Reflect.construct

/**
 * (纯函数)
 * 有条件地返回（用于简化链式的if）
 *
 * **最后一句的条件语句其实是装饰用的，不起实际作用**
 * @param conditionPairs 条件与返回值
 * @example
 * parallelIf(
 *   [insertStart === 0, 'start'],
 *   [getFirstChar(innerHTML.slice(insertEnd).replace(/<.*?>/g, '')) === '\n', 'end'], // TODO:要封一个clearInnerTag的工具函数
 *   [getLastChar(innerHTML.slice(0, insertStart).replace(/<.*?>/g, '')) === '\n', 'start'],
 *   'medium'
 * ) // 'start' | 'medium' | 'end'
 *
 * parallelIf(
 *   [type === 'all-in-column', gridTypeAllInColumn],
 *   [type === 'all-in-row', gridTypeAllInRow]
 * )
 */
export function parallelIf<T extends string>(
  ...conditionPairs: ([condition: boolean | (() => boolean), result: T | (() => T)] | T)[]
): T
export function parallelIf<T>(
  ...conditionPairs: ([condition: boolean | (() => boolean), result: T | (() => T)] | T)[]
): T
export function parallelIf(...conditionPairs) {
  const newConditionPairs = conditionPairs.map((conditionPair) =>
    Array.isArray(conditionPair) ? conditionPair : [true, conditionPair]
  )
  for (const [condition, result] of newConditionPairs) {
    if (isFunction(condition) ? condition() : condition) {
      return isFunction(result) ? result() : result
    }
  }
  const fallbackResult = getLastItem(newConditionPairs)![1]
  return isFunction(fallbackResult) ? fallbackResult() : fallbackResult
}

// TODO: It's type generic is not correct
/**
 * this Function can generally replace javascript:switch
 *
 * @param value detected value
 * @param conditionPairs conditions (one of them or none of them can match). this's returned Value must have same type.
 * @param fallbackValue
 * @example
 * parallelSwitch('hello', [
 *   [(k) => k.charAt(0) === 'h', 3],
 *   ['world', 4]
 * ]) //=> 3
 */
export function parallelSwitch<
  Base,
  Value extends Primitive // this type is not correct
>(
  value: Base,
  conditionPairs: Array<
    [
      is: NotFunctionValue | ((value: Base) => boolean),
      returnValue: Value | ((value: Base) => Value)
    ]
  >,
  fallbackValue?: Value
): Value {
  for (const [is, returnValue] of conditionPairs) {
    if (value === is || shrinkToValue(is, [value]) === true)
      return shrinkToValue(returnValue, [value])
  }
  return fallbackValue!
}

//#region ------------------- 测试 -------------------
// const a = parallelSwitch('hello', [
//   ['world', 1],
//   ['hello', 4]
// ])
// console.log('a: ', a)
//#endregion

export function tryCatch(tryFunction: () => any, catchFunction?: (err: unknown) => any) {
  try {
    return tryFunction()
  } catch (err) {
    return catchFunction?.(err)
  }
}

/**
 * 判断值是否满足接下来的一堆函数
 * （也可用一堆`&&`代替）
 * @param val 测试目标
 * @param judgers 测试函数们
 * @todo 这还应该是个复杂typeGard
 *
 * @example
 * canSatisfyAll({}, isObject) // true
 */
export function canSatisfyAll<T>(val: T, ...judgers: ((val: T) => boolean)[]) {
  return judgers.every((f) => f(val))
}
