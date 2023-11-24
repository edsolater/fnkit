import { createCurrentTimestamp } from './date/parseDate'

/**
 *
 * default {@link throttle}'s delay is 400ms
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 */
export function throttle<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    delay?: number
  }
): F {
  const middleParams = [] as Parameters<F>[]
  let currentTimoutId: any | null = null
  let prevDurationTimestamp: number | null = null
  let remainDelayTime = options?.delay ?? 400

  const invokeFn = () => {
    fn(...middleParams[middleParams.length - 1])
    middleParams.length = 0 // clear middleParams
    currentTimoutId = null // clear Timeout Id
    remainDelayTime = options?.delay ?? 400 // reset remain time
  }
  // @ts-expect-error force
  return (...args: Parameters<F>) => {
    middleParams.push(args)
    const currentTimestamp = createCurrentTimestamp()
    if (currentTimoutId) {
      clearTimeout(currentTimoutId)
      remainDelayTime -= prevDurationTimestamp ? currentTimestamp - prevDurationTimestamp : 0
    }
    if (remainDelayTime <= 0) {
      invokeFn()
    } else {
      currentTimoutId = setTimeout(invokeFn, remainDelayTime)
    }
    prevDurationTimestamp = currentTimestamp
  }
}

/**
 *
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 */
export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    delay?: number
  }
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
  }
) {
  throw new Error('TODO')
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
