import { clamp, map, type Int } from ".."
import { getType, isNumber, isObject } from "../dataType"
import { Numberish } from "../numberish/types"
import { DateInfoAtom, DateParam, TimeStampVerbose } from "./type"

/**
 * it use seconds(UNIX timestamp)
 * @example
 * createDate() //=> now
 * createDate(1633948800) //=> 2021-10-11T00:00:00.000Z
 */
export function createDate(): Date
export function createDate(value: DateParam): Date
export function createDate(...params: any[]): Date {
  if (params.length === 0) {
    return new Date()
  } else if (params.length === 1) {
    const value = params[0]
    if (value instanceof Date) {
      return new Date(value)
    } else if (isObject(value)) {
      const nowDate = new Date()
      const {
        year = getYear(nowDate),
        month = getMonth(nowDate),
        day = getDay(nowDate),
        hours = getHours(nowDate),
        minutes = getMinutes(nowDate),
        seconds = getSeconds(nowDate),
        milliseconds = getMilliseconds(nowDate),
      } = map(value as DateInfoAtom, Number)
      return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds)
    } else if (isNumber(value)) {
      return new Date(value * 1000)
    }
    return value ? new Date(value) : new Date()
  } else {
    throw new Error("Invalid arguments for createDate")
  }
}

export { createDate as getDate /* well-known alias */ }

export function setDate(oldDate: DateParam, options?: DateInfoAtom) {
  return createDate({
    year: options?.year ?? getYear(oldDate),
    month: options?.month ?? getMonth(oldDate),
    day: options?.day ?? getDay(oldDate),
    hours: options?.hours ?? getHours(oldDate),
    minutes: options?.minutes ?? getMinutes(oldDate),
    seconds: options?.seconds ?? getSeconds(oldDate),
    milliseconds: options?.milliseconds ?? getMilliseconds(oldDate),
  })
}

/** use seconds  */
export function getTime(value?: DateParam) {
  return createDate(value).getTime() / 1000
}

/**
 * @example
 * getUnixTime() //=> 1633948800
 */
export function getCurrentUnixTime() {
  return Number.parseInt(String(getTime())) as Int
}

/**
 * just a readable alias
 * !!use second
 */
export function getNow() {
  return getTime()
}

export function getISO(value?: DateParam) {
  return createDate(value).toISOString()
}

// same as createDate, useful for readibility
export function createCurrentDate() {
  return createDate()
}

/** use seconds not getMilliseconds */
export function createTimeStamp() {
  return getTime()
}

// alias for createTimeStamp
export const getTimeStamp = createTimeStamp

export function isCurrentDateBefore(timestamp: TimeStampVerbose): boolean {
  return isDateBefore(undefined, timestamp)
}
export function isCurrentDateAfter(timestamp: TimeStampVerbose): boolean {
  return isDateAfter(undefined, timestamp)
}
export function isSameDate(tested: TimeStampVerbose, matched?: TimeStampVerbose | undefined) {
  return getTime(tested) === getTime(matched)
}

export function isDateBefore(tested: DateParam, matched?: DateParam): boolean {
  return getTime(tested) < getTime(matched)
}
export function isDateAfter(tested: DateParam, matched?: DateParam): boolean {
  return getTime(tested) > getTime(matched)
}

export function offsetDateTime(
  baseDate: DateParam,
  offset: number,
  /** milliseconds by default */
  options?: {
    unit?: "years" | "months" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
  },
) {
  if (options?.unit === "months" || options?.unit === "years") {
    const { year, month, day, hours, minutes, seconds, milliseconds } = parseDate(baseDate)
    const wiredTotalMonth = year * 12 + month + offset * (options?.unit === "months" ? 1 : 12)
    const yearNumber = Math.floor(wiredTotalMonth / 12)
    const monthNumber = wiredTotalMonth % 12
    return createDate({
      year: yearNumber,
      month: monthNumber,
      day,
      hours,
      minutes,
      seconds,
      milliseconds,
    })
  } else {
    const timestamp = getTime(baseDate)
    const offsetedTimestampSeconds =
      timestamp +
      (options?.unit === "days"
        ? offset * 24 * 60 * 60
        : options?.unit === "hours"
          ? offset * 60 * 60
          : options?.unit === "minutes"
            ? offset * 60
            : options?.unit === "milliseconds"
              ? offset / 1000
              : offset)
    return createDate(offsetedTimestampSeconds)
  }
}

export function cloneDate(date: DateParam) {
  return createDate(getTime(date))
}
/**
 * this month number is base on 1. (e.g. 1 => January)
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMonth(date?: DateParam) {
  return createDate(date).getMonth() + 1
}
export function setMonth(date: DateParam, /* start from 1 */ monthNumber: number) {
  const newDate = cloneDate(date)
  newDate.setMonth(monthNumber - 1)
  return newDate
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getYear(date?: DateParam) {
  return createDate(date).getFullYear()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDay(date?: DateParam) {
  return createDate(date).getDate()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDayOfWeek(date?: DateParam) {
  return createDate(date).getDay()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getHours(date?: DateParam) {
  return createDate(date).getHours()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMinutes(date?: DateParam) {
  return createDate(date).getMinutes()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getSeconds(date?: DateParam) {
  return createDate(date).getSeconds()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMilliseconds(date?: DateParam) {
  return createDate(date).getMilliseconds()
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getTimestamp(date?: DateParam) {
  return getTime(date)
}

/**
 * @param date specified date or today
 * @requires {@link getYear `getYear()`} {@link getMonth `getMonth()`} {@link getDay `getDay()`} {@link getDayOfWeek `getDayOfWeek()`} {@link getHours `getHours()`} {@link getMinutes `getMinutes()`} {@link getSeconds `getSeconds()`} {@link getMilliseconds `getMilliseconds()`} {@link getTimestamp `getTimestamp()`} {@link getMonthLength `getMonthLength()`}
 */
export function parseDate(date?: DateParam) {
  const paramDate = createDate(date)
  return {
    fullDate: paramDate,
    year: getYear(paramDate),
    month: getMonth(paramDate),
    day: getDay(paramDate),
    dayOfWeek: getDayOfWeek(paramDate),
    hours: getHours(paramDate),
    minutes: getMinutes(paramDate),
    seconds: getSeconds(paramDate),
    milliseconds: getMilliseconds(paramDate),
    timestamp: getTimestamp(paramDate),
    monthLength: getMonthLength(getYear(paramDate), getMonth(paramDate)),
  }
}

/**
 *
 * @param date specified date or today
 * @returns currentMonthLength. (e.g. January)
 * @example
 * getMonthLength(2022, 1) => 31
 * getMonthLength(2022, 2) => 29
 * getMonthLength(2022, 3) => 31
 * getMonthLength(2022, 4) => 30
 */
export function getMonthLength(year: Numberish, month: Numberish): number {
  const currentYear = Number(year)
  const currentMonthCode = Number(month) - 1
  return new Date(currentYear, currentMonthCode + 1, 0).getDate()
}
