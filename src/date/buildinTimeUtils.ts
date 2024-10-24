import { isNumber, isString } from "../dataType"

/** use seconds not milliseconds */
export type TimeSignal = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "d"}`

export function isTimeSignal(time: any): time is TimeSignal {
  if (!isNumber(time) && !isString(time)) return false
  if (isNumber(time)) return true
  return /^[0-9]+\s?(ms|s|m|h|d)$/.test(time)
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeSignal | undefined) {
  return globalThis.setInterval(fn, interval ? parseTimeSignal(interval) : undefined)
}

export type IntervalTaskFunction = (utils: { loopCount: number }) => void

/**
 * build-in globalThis.setInterval is not human-friendly
 * @param fn function to run
 * @param options
 * @returns
 */
export function setInterval(
  fn: IntervalTaskFunction,
  options?: {
    interval: TimeSignal
    immediate?: boolean
  },
): { cancel(): void } {
  let loopCount = 0
  const run = () => fn({ loopCount: loopCount++ })

  if (options?.immediate) run()
  const timeId = setIntervalWithSecondes(run, options?.interval)
  return {
    cancel() {
      clearInterval(timeId)
    },
  }
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeSignal | undefined) {
  return globalThis.setTimeout(fn, delay ? parseTimeSignal(delay) : undefined)
}

export type TimeoutTaskFunction = (utils: { loopCount: number }) => void

/**
 * build-in globalThis.setTimeout is not human-friendly
 * @param fn function to run
 * @param options
 * @returns
 */
export function setTimeout(
  fn: TimeoutTaskFunction,
  options?: {
    delay: TimeSignal
    immediate?: boolean
  },
): { cancel(): void } {
  let loopCount = 0
  const run = () => fn({ loopCount: loopCount++ })

  if (options?.immediate) run()
  const timeId = setTimeoutWithSecondes(run, options?.delay)
  return {
    cancel() {
      clearTimeout(timeId)
    },
  }
}

/** to milliseconds */
export function parseTimeSignal(time: TimeSignal) {
  if (isNumber(time)) return time * 1000
  if (time.endsWith("ms")) return parseInt(time)
  if (time.endsWith("s")) return parseInt(time) * 1000
  if (time.endsWith("m")) return parseInt(time) * 1000 * 60
  if (time.endsWith("h")) return parseInt(time) * 1000 * 60 * 60
  if (time.endsWith("d")) return parseInt(time) * 1000 * 60 * 60 * 24
  throw new Error("Invalid time signal")
}
