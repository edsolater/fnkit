import { asyncInvoke } from "../../functionManagers"
import { type TimeUnitValue, parseTimeLabelToMilliseconds, isTimeLabel } from "../parseDuration"

/**
 * build-in milliseconds is not human-friendly
 */
export function runClientSetTimeoutWithSeconds(
  fn: (...args: any[]) => void,
  delay?: TimeUnitValue | undefined,
): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeLabelToMilliseconds(delay) : undefined)
}
function clearTimeout(timeoutId: number) {
  globalThis.clearTimeout(timeoutId)
}

export type TimeoutTaskFunction<R = any> = (utils: { loopCount: number; cancel: () => void }) => R

export type SetTimeoutOptions = {
  delay?: TimeUnitValue

  /** 立刻执行一次函数，但同时也会倒计时。应用在需要一开始就立刻执行一次的场景*/
  immediate?: boolean

  /** 需要手动触发，使用调用SetTimeoutController.start  */
  haveManuallyController?: boolean
}
export type SetTimeoutController<R> = {
  /** 获取定时器任务的结果,同步版使用{@link getCurrentResult}方法 */
  result: Promise<R>

  /** 同步获取定时器任务的结果，异步版使用{@link result}属性 */
  getCurrentResult(): R | undefined

  /** 取消定时器 */
  cancel(): void

  /** 当还有options?.haveManuallyController时，start方法是手动触发倒计时 */
  start(): void
}
/**
 * build-in globalThis.setTimeout is not human-friendly
 * @param taskFn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */

export function setTimeout<R>(
  taskFn: TimeoutTaskFunction<R>,
  rawOptions?: SetTimeoutOptions | TimeUnitValue,
): SetTimeoutController<R> {
  let loopCount = 0
  let timeId = 0
  let syncedResult: R | undefined = undefined
  const { promise: resultPromise, resolve, reject } = Promise.withResolvers<R>()

  const options: SetTimeoutOptions = isTimeLabel(rawOptions) ? { delay: rawOptions } : (rawOptions ?? {})
  // core
  const runCore = () => {
    const taskResult = asyncInvoke(() => taskFn({ loopCount: loopCount++, cancel }))
    taskResult
      .then((result) => {
        syncedResult = result
        resolve(result)
      })
      .catch(reject)
    return taskResult
  }

  function start() {
    if (options?.immediate) runCore()
    timeId = runClientSetTimeoutWithSeconds(runCore, options?.delay)
  }

  function cancel() {
    clearTimeout(timeId)
  }

  if (!options?.haveManuallyController) {
    start()
  }
  return { cancel, start, result: resultPromise, getCurrentResult: () => syncedResult }
}

/** @deprecated 这里只是兼容老代码， 建议直接使用 {@link setTimeout} */
export function setTimeoutWithSeconds<R>(taskFn: TimeoutTaskFunction<R>, delay?: TimeUnitValue) {
  return runClientSetTimeoutWithSeconds(taskFn, delay)
}

/**
 * 等待一段时间，单位是数字秒或时间标签（如 "2s", "1m"）
 */
export function sleep(delay?: TimeUnitValue | undefined): Promise<void> {
  return new Promise((resolve) => {
    runClientSetTimeoutWithSeconds(resolve, delay ?? 0)
  })
}
