import { isNumber } from "../dataType"

/** use seconds not milliseconds */
export type TimeSigal = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "d"}`

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: () => any, interval: TimeSigal) {
  return setInterval(fn, parseTimeSignal(interval))
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: () => any, delay: TimeSigal) {
  return setTimeout(fn, parseTimeSignal(delay))
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
