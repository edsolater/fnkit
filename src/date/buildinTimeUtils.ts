import { isNumber } from "../dataType"

/** use seconds not milliseconds */
export type TimeSigal = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "d"}`

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeSigal | undefined) {
  return globalThis.setInterval(fn, interval ? parseTimeSignal(interval) : undefined)
}

/**
 * build-in globalThis.setInterval is not human-friendly
 * @param fn function to run
 * @param options
 * @returns
 */
export function setInterval(
  fn: (...args: any[]) => void,
  options?: {
    interval: TimeSigal
    runImmediate?: boolean
  },
): { cancel(): void } {
  if (options?.runImmediate) fn()
  const timeId = setIntervalWithSecondes(fn, options?.interval)
  return {
    cancel() {
      clearInterval(timeId)
    },
  }
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeSigal | undefined) {
  return globalThis.setTimeout(fn, delay ? parseTimeSignal(delay) : undefined)
}

/**
 * build-in globalThis.setTimeout is not human-friendly
 * @param fn function to run
 * @param options
 * @returns
 */
export function setTimeout(
  fn: (...args: any[]) => void,
  options?: {
    delay: TimeSigal
    runImmediate?: boolean
  },
): { cancel(): void } {
  if (options?.runImmediate) fn()
  const timeId = setTimeoutWithSecondes(fn, options?.delay)
  return {
    cancel() {
      clearTimeout(timeId)
    },
  }
}

/** to milliseconds */
export function parseTimeSignal(time: TimeSigal) {
  if (isNumber(time)) return time * 1000
  if (time.endsWith("ms")) return parseInt(time)
  if (time.endsWith("s")) return parseInt(time) * 1000
  if (time.endsWith("m")) return parseInt(time) * 1000 * 60
  if (time.endsWith("h")) return parseInt(time) * 1000 * 60 * 60
  if (time.endsWith("d")) return parseInt(time) * 1000 * 60 * 60 * 24
  throw new Error("Invalid time signal")
}
