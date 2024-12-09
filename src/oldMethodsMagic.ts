import { shrinkFn, type MayFn } from "."
import { isString } from "./dataType"

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
 * Tries to execute a function and catches any errors that occur.
 * @param tryFunction The function to try executing.
 * @param catchFunction Optional function to handle errors.
 */
export function tryCatch<T>(tryFunction: () => T, catchFunction?: (err: unknown) => T) {
  try {
    return tryFunction()
  } catch (err) {
    return catchFunction?.(err)
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
