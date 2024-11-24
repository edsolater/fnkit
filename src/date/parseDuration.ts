import { ParsedDurationInfo } from "./type"

/**
 *  differ than {@link parseDurationAbsolute `parseDurationAbsolute()`}
 * `parseDuration(3000)` will return {seconds: 3, milliseconds: 0}
 * `parseDurationAbsolute(3000)` will return {seconds: 3, milliseconds: 3000}
 *
 * @param timestamp unit ms
 * @example
 * parseDuration(24 * 60 * 60) // {full: 24 * 60 * 60 , day: 1, hour: 0  minutes: 0, secends: 0, milliseconds: 0 }
 */

export function parseDuration(timestamp: number): ParsedDurationInfo {
  let diff = timestamp
  const values: ParsedDurationInfo = {
    exact: 0,
    full: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }
  values.exact = Math.max(diff, 0)
  values.full = Math.max(Math.floor(diff), 0)
  values.days = Math.max(Math.floor(diff / (60 * 60 * 24)), 0)
  diff -= values.days * (60 * 60 * 24)
  values.hours = Math.max(Math.floor(diff / (60 * 60)), 0)
  diff -= values.hours * (60 * 60)
  values.minutes = Math.max(Math.floor(diff / 60), 0)
  diff -= values.minutes * 60
  values.seconds = Math.max(diff, 0)
  diff -= values.seconds
  values.milliseconds = Math.max(diff * 1000, 0)
  return values
}

/**
 *  differ than {@link parseDuration `parseDuration()`}
 * `parseDuration(3000)` will return {seconds: 3, milliseconds: 0}
 * `parseDurationAbsolute(3000)` will return {seconds: 3, milliseconds: 3000}
 *
 * @param timestamp unit s
 * @example
 * parseDurationAbsolute(5 * 60) // {full: 5 * 60, day: 5/24/60, hour: 5/60  minutes: 5, secends: 5 * 60, milliseconds: 5 * 60 * 1000 }
 */
export function parseDurationAbsolute(timestamp: number): ParsedDurationInfo {
  return {
    exact: timestamp,
    full: Math.floor(timestamp),
    days: timestamp / 24 / 60 / 60,
    hours: timestamp / 60 / 60,
    minutes: timestamp / 60,
    seconds: timestamp,
    milliseconds: timestamp * 1000,
  }
}

export function isDurationInfo(value: any): value is ParsedDurationInfo {
  return (
    value &&
    typeof value === "object" &&
    "full" in value &&
    "days" in value &&
    "hours" in value &&
    "minutes" in value &&
    "seconds" in value &&
    "milliseconds" in value
  )
}
