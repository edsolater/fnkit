import { shrinkFn, type MayFn, type MayPromise } from ".";
import { isPromise } from "./dataType";

type AssertSyncValue<T> = T extends (...args: any[]) => any ? never : T extends Promise<any> ? never : T
type AssertSyncCondition<T> = () => AssertSyncValue<T>
type AssertAsyncCondition<T> = Promise<T> | (() => Promise<T>)

/**
 * 断言普通值、条件函数结果或异步条件结果为 truthy，否则抛出错误。
 *
 * 普通值分支用于断言“非函数、非 Promise”的值；函数会被当作条件函数执行，Promise 会被当作异步条件等待。
 *
 * @example
 * assert(user, "user 不能为空")
 *
 * @example
 * assert(() => user.isReady, "user 尚未就绪")
 *
 * @example
 * await assert(fetchReady(), "服务尚未就绪")
 */
export function assert<T>(
  condition: AssertSyncValue<T>,
  callback?: (payload: { value: T }) => void,
): asserts condition
export function assert<T>(
  condition: AssertSyncValue<T>,
  message?: string,
  callback?: (payload: { value: T; message: string }) => void,
): asserts condition
export function assert<T>(
  condition: AssertSyncCondition<T>,
  callback?: (payload: { value: T }) => void,
): asserts condition
export function assert<T>(
  condition: AssertSyncCondition<T>,
  message?: string,
  callback?: (payload: { value: T; message: string }) => void,
): asserts condition
export function assert<T>(
  condition: AssertAsyncCondition<T>,
  callback?: (payload: { value: T }) => MayPromise<void>,
): Promise<void>
export function assert<T>(
  condition: AssertAsyncCondition<T>,
  message?: string,
  callback?: (payload: { value: T; message: string }) => MayPromise<void>,
): Promise<void>

export function assert(condition, arg0?, arg1?): any {
  const message = typeof arg0 === "string" ? arg0 : undefined
  const callback = typeof arg0 === "function" ? arg0 : typeof arg1 === "function" ? arg1 : undefined
  const conditionValue = shrinkFn(condition)

  // ---------- 异步部分 ----------
  if (isPromise(conditionValue)) {
    return conditionValue.then(async (resolvedValue) => {
      if (!resolvedValue) {
        await callback?.({ value: resolvedValue, message: message })
        throw new Error(message)
      }
    })
  }

  // ---------- 同步部分 ----------
  if (!conditionValue) {
    callback?.({ value: conditionValue, message: message })
    throw new Error(message)
  }
}

/**
 * 按默认 truthy 规则或自定义条件断言变量。
 *
 * 断言失败时会把消息和变量输出到 `console.log`，再由 {@link assert} 抛错。
 *
 * @param variable 要检查的变量。
 * @param options 可传入失败消息，或自定义判断函数与失败消息。
 *
 * @example
 * assertVariable(name, "name 不能为空")
 *
 * @example
 * assertVariable(age, (value) => value >= 18, (value) => `年龄过小：${value}`)
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
 * 执行任务并断言任务没有失败，失败时抛出错误。
 *
 * `tryFunction` 成功时返回任务结果；任务抛错时沿用 {@link tryCatch} 的当前行为。
 *
 * @example
 * const value = tryAssert(() => JSON.parse(text), "JSON 解析失败")
 */
export function tryAssert<T>(
  tryFunction: () => T,
  catchFunction?: ((err: Error) => void) | string,
  assertCondition: (err: Error | undefined) => boolean = () => true,
): T {
  let errObj: Error | undefined = undefined
  const result = tryCatch(tryFunction, (err) => {
    errObj = err
  })
  assert(errObj == null && assertCondition(errObj), shrinkFn(catchFunction, [errObj!]) ?? errObj)
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
