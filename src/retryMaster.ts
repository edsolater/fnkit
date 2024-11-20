import { setTimeoutWithSecondes, type TimeType } from "./date"
import type { Int } from "./typings"
import { shrinkFn } from "./wrapper"

type RetriableTaskFnPayloads = {
  /**
   * start from 0
   *
   * 0 is the first try
   */
  tryIndex: number
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
export function autoRetry<F extends (payloads: RetriableTaskFnPayloads) => Promise<any>>(
  task: F,
  options?: {
    /**
     * each xxx seconds will invoke the function , (unless it has success or it reach the maxRetryCount)
     * user can pass a function to accordin the retryCount to control the frequency of retry
     *
     * !if not set, it will run immediately after the previous task failed
     *
     * @example
     * 3 // action will be re-invoke after next 3 seconds
     * @example
     * (retryCount) => retryCount * 3 // action will be re-invoke after next 3 seconds in first time , 6 seconds in second time , 9 seconds in third time
     */
    retryFrequency?: TimeType | ((retryCount: Int<1>) => TimeType)

    /**
     * maxRetryCount will back to zero , if action has success
     * @example
     * 2 // action will be re-invoke at most 2 times (run 1 time, then re-run 2 times)
     */
    maxRetryCount?: Int<1>

    /** by default, if the return value is not undefined, it will be considered as success */
    checkSuccess?: (returnValue: Awaited<ReturnType<F>>) => boolean
    /** user can manually reject the promise */
    maxRetryRejectReason?: string
  },
): ReturnType<F> {
  let retryTimes = 0

  const checkSuccess = options?.checkSuccess ?? ((v) => v != null)

  const { reject, resolve, promise } = Promise.withResolvers()
  let hasEnded = false

  function resolveTask(value: any) {
    resolve(value)
    hasEnded = true
  }

  function canContinue(): boolean {
    if (retryTimes > (options?.maxRetryCount ?? 2)) {
      reject(options?.maxRetryRejectReason ?? "maxRetryCount reached")
      hasEnded = true
    }
    return !hasEnded
  }

  function tryToRunNextAction() {
    if (!canContinue()) return
    startRunAction()
  }

  function startRunAction() {
    const thisTurnTryIndex = retryTimes++
    const nextDelay = options?.retryFrequency ? shrinkFn(options.retryFrequency, [thisTurnTryIndex]) : undefined

    task({ tryIndex: thisTurnTryIndex }).then((result) => {
      if (checkSuccess(result)) resolveTask(result)
      if (!nextDelay) {
        tryToRunNextAction()
      }
    })

    if (nextDelay) {
      setTimeoutWithSecondes(() => {
        tryToRunNextAction()
      }, nextDelay)
    }
  }

  startRunAction()

  return promise as any
}
