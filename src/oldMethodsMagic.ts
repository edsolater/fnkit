import { shrinkFn, type MayFn } from "."
import { isPromise } from "./dataType"

export function assert(condition: any, callback?: () => void): asserts condition
export function assert(condition: any, msg?: string, callback?: (msg: string) => void): asserts condition
export function assert(condition: any, arg0?: string | (() => void), arg1?: (msg: string) => void): asserts condition {
  const msg = typeof arg0 === "string" ? arg0 : undefined
  const callback = typeof arg0 === "function" ? arg0 : typeof arg1 === "function" ? arg1 : undefined
  if (!condition) {
    // @ts-ignore
    callback?.(msg)
    throw new Error(msg)
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
 *
 * 如果未写catchFunction或者catchFunction返回了非T，则最终返回 T | undefined。相当于尝试了任务，但是尝试失败了，于是会返回undefined。
 *
 * Tries to execute a function and catches any errors that occur.
 * @param coreTask The function to try executing.
 * @param catchFunction Optional function to handle errors.
 */
export function tryCatch<T>(
  coreTask: () => undefined | null,
  catchFunction?: (err: Error) => undefined | null,
): undefined | null
export function tryCatch<T>(coreTask: () => Promise<T>, catchFunction: (err: Error) => NoInfer<T>): Promise<T>
export function tryCatch<T>(coreTask: () => Promise<T>, catchFunction?: (err: Error) => void): Promise<T | undefined>
export function tryCatch<T>(coreTask: () => T, catchFunction: (err: Error) => NoInfer<T>): T
export function tryCatch<T>(coreTask: () => T, catchFunction?: (err: Error) => void): T | undefined
export function tryCatch<T>(coreTask: () => T, catchFunction?: (err: Error) => NoInfer<T> | void) {
  function getFallbackValueOrThrowErr(err: Error): NoInfer<T> | void {
    const fallbackValue = catchFunction?.(err)
    if (fallbackValue == null) {
      throw err
    }
    return fallbackValue
  }

  try {
    const result = coreTask()
    if (isPromise(result)) {
      return result.catch((err) => getFallbackValueOrThrowErr(err)) as Promise<NonNullable<T>>
    }
    return result as NonNullable<T>
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    const fallbackValue = getFallbackValueOrThrowErr(error)
    return fallbackValue
  }
}

/**
 * 类似于assert，出错就终止程序了
 */
export function tryAssert<T>(tryFunction: () => T, catchFunction?: (err: Error) => void): T {
  let errObj: Error | undefined = undefined
  const result = tryCatch(tryFunction, (err) => {
    errObj = err
    catchFunction?.(errObj)
  })
  assert(errObj == null, errObj)
  return result as T
}

/**
 * Checks if a value satisfies all provided functions.
 * @param val The value to test.
 * @param judgers The functions to test against the value.
 */
export function canSatisfyAll<T>(val: T, ...judgers: ((val: T) => boolean)[]) {
  return judgers.every((f) => f(val))
}
