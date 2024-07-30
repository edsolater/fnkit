import { isNumber } from "../dataType"

/** use seconds not milliseconds */
export type TimeSigal = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "d"}`

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeSigal | undefined) {
  return setInterval(fn, interval ? parseTimeSignal(interval) : undefined)
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeSigal | undefined) {
  return setTimeout(fn, delay ? parseTimeSignal(delay) : undefined)
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
