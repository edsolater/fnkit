import { shrinkFn, type MayFn, type NilKeys } from "."
import { isPromise, isString } from "./dataType"

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

/**
 * a useful method to assert variable
 * @param variable
 * @param options message and when
 */
export function assertVariable<T>(
  variable: T,
  ...options:
    | [when: (v: T) => boolean, message: MayFn<string, [variable: T]>]
    | [message: MayFn<string, [variable: T]>]
    | []
) {
  const when = options.length == 2 ? options[0] : (v: any) => Boolean(v)
  const message = options.length == 2 ? options[1] : options.length == 1 ? options[0] : ""
  assert(when(variable), shrinkFn(message, [variable]), () => {
    if (message) {
      console.log(message, variable)
    } else {
      console.log(variable)
    }
  })
}

//#region ------------------- test -------------------
// const a = parallelSwitch('hello', [
//   ['world', 1],
//   ['hello', 4]
// ])
// console.log('a: ', a)
//#endregion

/**
 * 如果可能异步，请使用 asyncTryCatch 代替。它内部使用Promise.try实现。
 *
 * 如果未写catch或者catch返回了undefined，则会重新抛出错误。
 *
 * Tries to execute a function and catches any errors that occur.
 * @param tryFunction The function to try executing.
 * @param catchFunction Optional function to handle errors.
 */
export function tryCatch<T>(
  tryFunction: () => undefined | null,
  catchFunction?: (err: unknown) => undefined | null,
): undefined | null
export function tryCatch<T>(tryFunction: () => Promise<T>, catchFunction?: (err: unknown) => T): Promise<T>
export function tryCatch<T>(tryFunction: () => T, catchFunction?: (err: unknown) => T): NonNullable<T>
export function tryCatch<T>(tryFunction: () => T, catchFunction?: (err: unknown) => T) {
  try {
    const result = tryFunction()
    if (isPromise(result)) {
      return Promise.try(() => result).catch((err) => {
        const fallbackValue = catchFunction?.(err)
        if (fallbackValue == null) {
          throw err
        }
        return fallbackValue
      }) as Promise<NonNullable<T>>
    }
    return result as NonNullable<T>
  } catch (err) {
    const fallbackValue = catchFunction?.(err)
    if (fallbackValue == null) {
      throw err
    }
    return fallbackValue
  }
}

/**
 * Checks if a value satisfies all provided functions.
 * @param val The value to test.
 * @param judgers The functions to test against the value.
 */
export function canSatisfyAll<T>(val: T, ...judgers: ((val: T) => boolean)[]) {
  return judgers.every((f) => f(val))
}
