import { setTimeoutWithSecondes } from "./date"
import type { Int } from "./typings"
import { shrinkFn } from "./wrapper"

type RetriableTaskFnPayloads = {
  retryCount: number
  flagActionHasSuccess(value: any): void
}

/**
 * usually task is async
 * /** usually task is async
 * @example
 * autoRetry(async ({retryCount, resolve, reject}) => {
 *  if(retryCount === 3){
 *      resolve('success')
 *   }, {
 *      retryFrequency: 3,
 *      maxRetryCount: 5
 *   }) // will be resolved after 3 seconds
 */
export function autoRetry<F extends (payloads: RetriableTaskFnPayloads) => any>(
  task: F,
  options: {
    /**
     * each xxx seconds will invoke the function , (unless it has success or it reach the maxRetryCount)
     * user can pass a function to accordin the retryCount to control the frequency of retry
     * @example
     * 3 // action will be re-invoke after next 3 seconds
     * @example
     * (retryCount) => retryCount * 3 // action will be re-invoke after next 3 seconds in first time , 6 seconds in second time , 9 seconds in third time
     */
    retryFrequency: number | ((retryCount: Int<1>) => number)

    /**
     * maxRetryCount will back to zero , if action has success
     * @example
     * 5 // action will be re-invoke at most 5 times
     */
    maxRetryCount: Int<1>
  },
): Promise<unknown> {
  let retryTimes = 0
  let hasEnded = false

  const { reject, resolve, promise } = Promise.withResolvers()

  const flagActionHasSuccess = (value: any) => {
    resolve(value)
    hasEnded = true
  }

  const canContinue = (): boolean => {
    if (retryTimes > options.maxRetryCount) {
      reject("maxRetryCount reached")
      hasEnded = true
    }
    return !hasEnded
  }

  const tryAgain = () => {
    retryTimes++

    if (!canContinue()) return

    const nextDelay = shrinkFn(options.retryFrequency, [retryTimes])
    task({ retryCount: retryTimes, flagActionHasSuccess })
    setTimeoutWithSecondes(() => {
      tryAgain()
    }, nextDelay)
  }

  tryAgain()

  return promise as any
}
