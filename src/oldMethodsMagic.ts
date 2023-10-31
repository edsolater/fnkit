import { isString } from './dataType'

export function assert(condition: any, callback?: () => void): asserts condition
export function assert(condition: any, msg?: string, callback?: (msg: string) => void): asserts condition
export function assert(condition: any, arg0?: string | (() => void), arg1?: (msg: string) => void): asserts condition {
  if (!condition) {
    if (arg1) {
      arg1(arg0 as string)
      throw new Error(arg0 as string)
    } else if (isString(arg0)) {
      throw new Error(arg0 as string)
    } else {
      arg0?.()
      throw new Error()
    }
  }
}

export const neww = Reflect.construct

//#region ------------------- 测试 -------------------
// const a = parallelSwitch('hello', [
//   ['world', 1],
//   ['hello', 4]
// ])
// console.log('a: ', a)
//#endregion

/**
 * simple but useful shortcut
 */
export function tryCatch<T>(tryFunction: () => T): T | undefined
export function tryCatch<T, F>(tryFunction: () => T, catchFunction: (err: unknown) => F): T | F
export function tryCatch<T>(tryFunction: () => T, catchFunction?: (err: unknown) => T) {
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
