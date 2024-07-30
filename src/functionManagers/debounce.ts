import { createTimeStamp, setTimeoutWithSecondes } from ".."

const defaultDebouneDelay = 400
const defaultThrottleDelay = 400

/**
 *
 * @requires {@link createTimeStamp `createCurrentTimestamp()`}
 */
export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    debounceDelay?: number
  },
): F {
  let lastInvokedTimestamp = 0
  const { debounceDelay = defaultDebouneDelay } = options ?? {}
  //@ts-ignore
  return (...args) => {
    const currentTimestamp = createTimeStamp()
    if (currentTimestamp - lastInvokedTimestamp > debounceDelay) {
      lastInvokedTimestamp = currentTimestamp
      return fn(...args)
    }
  }
}

/**
 *
 * @requires {@link createTimeStamp `createCurrentTimestamp()`}
 */
export function throttle<F extends (...args: any[]) => void>(
  fn: F,
  options?: {
    delay?: number
  },
): F {
  const middleParams = [] as Parameters<F>[]
  let currentTimoutId: any | null = null
  let prevDurationTimestamp: number | null = null
  let remainDelayTime = options?.delay ?? defaultThrottleDelay

  const invokeFn = () => {
    fn(...middleParams[middleParams.length - 1])
    middleParams.length = 0 // clear middleParams
    currentTimoutId = null // clear Timeout Id
    remainDelayTime = options?.delay ?? defaultThrottleDelay // reset remain time
  }
  // @ts-expect-error force
  return (...args: Parameters<F>) => {
    middleParams.push(args)

    const currentTimestamp = createTimeStamp()

    if (currentTimoutId) {
      clearTimeout(currentTimoutId)
      remainDelayTime -= prevDurationTimestamp ? currentTimestamp - prevDurationTimestamp : 0
    }

    if (remainDelayTime <= 0) {
      invokeFn()
    } else {
      currentTimoutId = setTimeoutWithSecondes(invokeFn, remainDelayTime)
    }

    prevDurationTimestamp = currentTimestamp
  }
}
