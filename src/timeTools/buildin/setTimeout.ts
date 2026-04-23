import { asyncInvoke } from "../../functionManagers"
import { type TimeLabel, parseTimeLabelToMilliseconds, isTimeLabel } from "../parseDuration"

/**
 * build-in milliseconds is not human-friendly
 */
export function runBuildinSetTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeLabel | undefined): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeLabelToMilliseconds(delay) : undefined)
}
function clearTimeout(timeoutId: number) {
  globalThis.clearTimeout(timeoutId)
}

export type TimeoutTaskFunction = (utils: { loopCount: number; cancel: () => void }) => void

export type SetTimeoutOptions = {
  delay?: TimeLabel

  /** 立刻执行一次函数，但同时也会倒计时。应用在需要一开始就立刻执行一次的场景*/
  immediate?: boolean

  /** 需要手动触发，使用调用SetTimeoutController.start  */
  haveManuallyController?: boolean
}

export type SetTimeoutController = {
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

export function setTimeout(
  taskFn: TimeoutTaskFunction,
  rawOptions?: SetTimeoutOptions | TimeLabel,
): SetTimeoutController {
  let loopCount = 0
  let timeId = 0

  const options: SetTimeoutOptions = isTimeLabel(rawOptions) ? { delay: rawOptions } : (rawOptions ?? {})
  // core
  const runCore = () => asyncInvoke(() => taskFn({ loopCount: loopCount++, cancel }))

  function start() {
    if (options?.immediate) runCore()
    timeId = runBuildinSetTimeoutWithSecondes(runCore, options?.delay)
  }

  function cancel() {
    clearTimeout(timeId)
  }

  if (!options?.haveManuallyController) {
    start()
  }
  return { cancel, start }
}
