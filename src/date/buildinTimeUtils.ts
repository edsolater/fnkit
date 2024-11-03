import { isNumber, isString } from "../dataType"
import { asyncInvoke } from "../functionManagers"

/** use seconds not milliseconds */
export type TimeSignal = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "d"}`
export type TimeType = number /* s */ | `${number}${"ms" | "s" | "m" | "H" | "D" | "W" | "M" | "Y"}`

export function isTimeSignal(time: any): time is TimeSignal {
  if (!isNumber(time) && !isString(time)) return false
  if (isNumber(time)) return true
  return /^[0-9]+\s?(ms|s|m|h|d)$/.test(time)
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeSignal | undefined): number {
  // @ts-ignore
  return globalThis.setInterval(fn, interval ? parseTimeTypeToMilliseconds(interval) : undefined)
}

export type IntervalTaskFunction = (utils: { cancel: () => void; loopCount: number }) => void

/**
 * build-in globalThis.setInterval is not human-friendly
 * @param fn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setInterval(
  fn: IntervalTaskFunction,
  options?: {
    interval: TimeSignal
    immediate?: boolean
    /** if set this, don't auto-run  */
    haveManuallyController?: boolean
  },
): { cancel(): void; run(): void } {
  let loopCount = 0
  let timeId = 0

  const runCore = () => asyncInvoke(() => fn({ loopCount: loopCount++, cancel }))

  function cancel() {
    clearInterval(timeId)
  }

  function run() {
    if (options?.immediate) runCore()
    timeId = setIntervalWithSecondes(runCore, options?.interval)
  }

  if (!options?.haveManuallyController) {
    run()
  }

  return { cancel, run }
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeSignal | undefined): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeTypeToMilliseconds(delay) : undefined)
}

export type TimeoutTaskFunction = (utils: { loopCount: number; cancel: () => void }) => void

/**
 * build-in globalThis.setTimeout is not human-friendly
 * @param fn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setTimeout(
  fn: TimeoutTaskFunction,
  options?: {
    delay?: TimeSignal
    /** if set this, fn will run immediately, (two times total) */
    immediate?: boolean
    /** if set this, don't auto-run  */
    haveManuallyController?: boolean
  },
): { cancel(): void; run(): void } {
  let loopCount = 0
  let timeId = 0
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

/** to milliseconds */
export function parseTimeTypeToMilliseconds(time: TimeSignal) {
  if (isNumber(time)) return time * 1000
  if (time.endsWith("ms")) return parseInt(time)
  if (time.endsWith("s")) return parseInt(time) * 1000
  if (time.endsWith("m")) return parseInt(time) * 1000 * 60
  if (time.endsWith("h")) return parseInt(time) * 1000 * 60 * 60
  if (time.endsWith("d")) return parseInt(time) * 1000 * 60 * 60 * 24
  throw new Error("Invalid time signal")
}
export function parseTimeTypeToSeconds(time: TimeType) {
  if (isNumber(time)) return time
  if (time.endsWith("ms")) return parseInt(time) / 1000
  if (time.endsWith("s")) return parseInt(time)
  if (time.endsWith("m")) return parseInt(time) * 60
  if (time.endsWith("H")) return parseInt(time) * 60 * 60
  if (time.endsWith("D")) return parseInt(time) * 60 * 60 * 24
  if (time.endsWith("W")) return parseInt(time) * 60 * 60 * 24 * 7
  if (time.endsWith("M")) return parseInt(time) * 60 * 60 * 24 * 30
  if (time.endsWith("Y")) return parseInt(time) * 60 * 60 * 24 * 365
  throw new Error("Invalid time signal")
}
