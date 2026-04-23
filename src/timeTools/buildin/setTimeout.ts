import { asyncInvoke } from "../../functionManagers"
import { type TimeLabel, parseTimeLabelToMilliseconds, isTimeLabel } from "../parseDuration"

/**
 * build-in milliseconds is not human-friendly
 */

export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeLabel | undefined): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeLabelToMilliseconds(delay) : undefined)
}

export type TimeoutTaskFunction = (utils: { loopCount: number; cancel: () => void }) => void

export type SetTimeoutOptions = {
  delay?: TimeLabel
  /** if set this, fn will run immediately, (two times total) */
  immediate?: boolean
  /** if set this, don't auto-run  */
  haveManuallyController?: boolean
}

export type SetTimeoutController = {
  cancel(): void
  run(): void
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

  function run() {
    if (options?.immediate) runCore()
    timeId = setTimeoutWithSecondes(runCore, options?.delay)
  }

  function cancel() {
    clearTimeout(timeId)
  }

  if (!options?.haveManuallyController) {
    run()
  }
  return { cancel, run }
}
