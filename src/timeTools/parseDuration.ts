import { isNumber, isString } from "../dataType"
import { DurationInfo } from "./parseDuration.type"

/**
 *  differ than {@link parseDurationAbsolute `parseDurationAbsolute()`}
 * `parseDuration(3000)` will return {seconds: 3, milliseconds: 0}
 * `parseDurationAbsolute(3000)` will return {seconds: 3, milliseconds: 3000}
 *
 * @param timestamp unit ms
 * @example
 * parseDuration(24 * 60 * 60) // {full: 24 * 60 * 60 , day: 1, hour: 0  minutes: 0, secends: 0, milliseconds: 0 }
 */

export function parseDuration(timestamp: number): DurationInfo {
  let diff = timestamp
  const values: DurationInfo = {
    exact: 0,
    full: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }
  values.exact = Math.max(Math.floor(diff * 1000), 0) / 1000
  values.full = Math.max(Math.floor(diff * 1000), 0) / 1000
  values.days = Math.max(Math.floor(diff / (60 * 60 * 24)), 0)
  diff -= values.days * (60 * 60 * 24)
  values.hours = Math.max(Math.floor(diff / (60 * 60)), 0)
  diff -= values.hours * (60 * 60)
  values.minutes = Math.max(Math.floor(diff / 60), 0)
  diff -= values.minutes * 60
  values.seconds = Math.max(Math.floor(diff), 0)
  diff -= values.seconds
  values.milliseconds = Math.max(Math.floor(diff * 1000), 0)
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
export function parseDurationAbsolute(timestamp: number): DurationInfo {
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

export function isDurationInfo(value: any): value is DurationInfo {
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
/** use seconds not milliseconds */
export type TimeRange = number /* s */ | `${number}${TimeUnit}` | `${number} ${TimeUnit}`

export type TimeUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days" // 数学简化， 1 day = 24 hours
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "ms"
  | "s"
  | "m"
  | "h"
  | "H"
  | "d"
  | "D"
  | "W"
  | "M"
  | "Y"

export function isTimeRange(time: any): time is TimeRange {
  if (isNumber(time)) return true
  if (!isString(time)) return false
  const trimmed = time.trim()
  return /^-?\d+(?:\.\d+)?\s*(milliseconds|seconds|minutes|hours|days|millisecond|second|minute|hour|day|ms|s|m|h|H|d|D|W|M|Y)$/.test(
    trimmed,
  )
}
/** to milliseconds */
export function parseTimeRangeToMilliseconds(time: TimeRange) {
  return parseTimeRange(time) * 1000
}
/** @deprecated 使用命名友好的 {@link parseTimeRange} */
export function parseTimeRangeToSeconds(time: TimeRange) {
  return parseTimeRange(time)
}

export function parseTimeRange(time: TimeRange) {
  if (isNumber(time)) return time

  const trimmed = time.trim()
  const matched =
    /^(-?\d+(?:\.\d+)?)\s*(milliseconds|seconds|minutes|hours|days|millisecond|second|minute|hour|day|ms|s|m|h|H|d|D|W|M|Y)$/.exec(
      trimmed,
    )
  if (!matched) throw new Error("Invalid time type")

  const value = Number.parseFloat(matched[1])
  const unit = matched[2]

  if (unit === "ms" || unit === "millisecond" || unit === "milliseconds") return value / 1000
  if (unit === "s" || unit === "second" || unit === "seconds") return value
  if (unit === "m" || unit === "minute" || unit === "minutes") return value * 60
  if (unit === "h" || unit === "H" || unit === "hour" || unit === "hours") return value * 60 * 60
  if (unit === "d" || unit === "D" || unit === "day" || unit === "days") return value * 60 * 60 * 24
  if (unit === "W") return value * 60 * 60 * 24 * 7
  if (unit === "M") return value * 60 * 60 * 24 * 30
  if (unit === "Y") return value * 60 * 60 * 24 * 365

  throw new Error("Invalid time type")
}
