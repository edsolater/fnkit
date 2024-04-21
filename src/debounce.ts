import { createCurrentTimestamp } from "./date/parseDate"
import type { AnyFn } from "./typings"

/**
 *
 * default {@link throttle}'s delay is 400ms
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 */
export function throttle(fn: AnyFn, options?: { rAF?: boolean; /** option for setTimeout */ delay?: number }) {
  if (options?.rAF) {
    let requestAnimationFrameId: number | undefined = undefined
    return function throttled(...args: any[]) {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId)
      requestAnimationFrameId = requestAnimationFrame(() => {
        requestAnimationFrameId = undefined
        fn(...args)
      })
    }
  } else {
    let timoutId: any | undefined = undefined
    return function throttled(...args: any[]) {
      if (timoutId) clearTimeout(timoutId)
      timoutId = setTimeout(() => {
        timoutId = undefined
        fn(...args)
      }, options?.delay ?? 100)
    }
  }
}

/** need DOM */
function cancelAnimationFrame(requestAnimationFrameId: number) {
  globalThis.cancelAnimationFrame?.(requestAnimationFrameId)
}

/** need DOM */
function requestAnimationFrame(fn: AnyFn) {
  return globalThis.requestAnimationFrame?.(fn)
}

/**
 *
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 */
export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    delay?: number
  },
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timeoutId
  return (...args: Parameters<F>) =>
    new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        const returnedValue = fn(...args) as ReturnType<F>
        resolve(returnedValue)
      }, options?.delay ?? 400)
    })
}

/**
 * debounce do: a method that use debounce to directly handle effect
 */
export function debounceDo<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    /** default is function self as key, any value that can be used as a key  */
    key?: any
    delay?: number
  },
) {
  throw new Error("TODO")
}
// /** TODO */
// /** 防抖（前置型） */
// export function debounce<F extends (...args: any[]) => any>(fn: F): F {
//   let lastInvokedTime = 0
//   const errorRateTime = 400 // (防抖)的容错时间
//   //@ts-ignore
//   return (...args) => {
//     const currentTime = Date.now()
//     if (currentTime - lastInvokedTime > errorRateTime) {
//       lastInvokedTime = currentTime
//       return fn(...args)
//     }
//   }
// }
