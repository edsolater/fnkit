import { shrinkFn, type MayFn } from ".."
import { isNumber, isString } from "../dataType"
import { asyncInvoke } from "../functionManagers"

/** use seconds not milliseconds */
export type TimeType = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "H" | "d" | "D" | "W" | "M" | "Y"}`

export function isTimeType(time: any): time is TimeType {
  if (!isNumber(time) && !isString(time)) return false
  if (isNumber(time)) return true
  return /^[0-9]+\s?(ms|s|m|h|H|d|D|W|M|Y)$/.test(time)
}

/** to milliseconds */
export function parseTimeTypeToMilliseconds(time: TimeType) {
  if (isNumber(time)) return time * 1000
  if (time.endsWith("ms")) return parseInt(time)
  if (time.endsWith("s")) return parseInt(time) * 1000
  if (time.endsWith("m")) return parseInt(time) * 1000 * 60
  if (time.endsWith("h") || time.endsWith("H")) return parseInt(time) * 1000 * 60 * 60
  if (time.endsWith("d") || time.endsWith("D")) return parseInt(time) * 1000 * 60 * 60 * 24
  if (time.endsWith("W")) return parseInt(time) * 1000 * 60 * 60 * 24 * 7
  if (time.endsWith("M")) return parseInt(time) * 1000 * 60 * 60 * 24 * 30
  if (time.endsWith("Y")) return parseInt(time) * 1000 * 60 * 60 * 24 * 365
  throw new Error("Invalid time type")
}
export function parseTimeTypeToSeconds(time: TimeType) {
  if (isNumber(time)) return time
  if (time.endsWith("ms")) return parseInt(time) / 1000
  if (time.endsWith("s")) return parseInt(time)
  if (time.endsWith("m")) return parseInt(time) * 60
  if (time.endsWith("h") || time.endsWith("H")) return parseInt(time) * 60 * 60
  if (time.endsWith("d") || time.endsWith("D")) return parseInt(time) * 60 * 60 * 24
  if (time.endsWith("W")) return parseInt(time) * 60 * 60 * 24 * 7
  if (time.endsWith("M")) return parseInt(time) * 60 * 60 * 24 * 30
  if (time.endsWith("Y")) return parseInt(time) * 60 * 60 * 24 * 365
  throw new Error("Invalid time type")
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeType | undefined): number {
  // @ts-ignore
  return globalThis.setInterval(fn, interval ? parseTimeTypeToMilliseconds(interval) : undefined)
}

export type IntervalTaskFunction = (utils: {
  cancel: () => void
  /** start from 0 */
  loopIndex: number
  changeInterval: (newInterval: MayFn<TimeType, [oldIntervalSeconds: number]>) => void
}) => void

export type SetIntervalOptions = {
  /** if you want run immediately after delay. both set `delay` and `immediate` */
  delay?: TimeType
  interval?: TimeType
  immediate?: boolean
  /** if set this, don't auto-run  */
  haveManuallyController?: boolean
}

export type SetIntervalController = {
  cancel(): void
  run(): void
  forceRunNextLoop(): void
}

/**
 * build-in globalThis.setInterval is not human-friendly
 * @param fn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setInterval(fn: IntervalTaskFunction, options?: SetIntervalOptions): SetIntervalController {
  let loopIndex = 0
  let intervalTimeId = 0
  let timeoutId = 0
  let intervalSeconds = parseTimeTypeToSeconds(options?.interval ?? 1)

  function changeInterval(newInterval: MayFn<TimeType, [oldIntervalSeconds: number]>) {
    intervalSeconds = parseTimeTypeToSeconds(shrinkFn(newInterval, [intervalSeconds]))
    stopLoop()
    runLoop({ canWithImmediate: false })
  }

  function stopLoop() {
    clearTimeout(timeoutId)
    clearInterval(intervalTimeId)
  }

  function runLoop(innerOptions: { canWithImmediate: boolean; forceImmediate?: boolean } = { canWithImmediate: true }) {
    function runCore() {
      asyncInvoke(() => fn({ loopIndex: loopIndex++, cancel: stopLoop, changeInterval }))
    }
    function innerRun() {
      if ((innerOptions.canWithImmediate && options?.immediate) || innerOptions.forceImmediate) runCore()
      intervalTimeId = setIntervalWithSecondes(runCore, intervalSeconds)
    }

    if (!innerOptions.forceImmediate && options?.delay) {
      timeoutId = setTimeoutWithSecondes(() => {
        innerRun()
      }, options.delay)
    } else {
      innerRun()
    }
  }
  function forceNext() {
    stopLoop()
    runLoop({ canWithImmediate: true, forceImmediate: true })
  }

  if (!options?.haveManuallyController) {
    runLoop()
  }

  return { cancel: stopLoop, run: runLoop, forceRunNextLoop: forceNext }
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeType | undefined): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeTypeToMilliseconds(delay) : undefined)
}

export type TimeoutTaskFunction = (utils: { loopCount: number; cancel: () => void }) => void

export type SetTimeoutOptions = {
  delay?: TimeType
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
 * @param fn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setTimeout(fn: TimeoutTaskFunction, flexibleOptions?: SetTimeoutOptions | TimeType): SetTimeoutController {
  let loopCount = 0
  let timeId = 0

  const options: SetTimeoutOptions = isTimeType(flexibleOptions) ? { delay: flexibleOptions } : flexibleOptions ?? {}
  // core
  const runCore = () => asyncInvoke(() => fn({ loopCount: loopCount++, cancel }))

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
