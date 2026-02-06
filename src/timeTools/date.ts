import type { MayEnum } from ".."
import { getType, isJSDate, isNumber } from "../dataType"
import type { Int } from "../typings"
import { isObjectDateInfoAtom, type DateInfoAtom } from "./dateInfoAtom"
import { JSDate, transformInfoToJSDate } from "./dateJSDate"
import { getDayOfWeek, getMonth } from "./dateOperations"
export * from "./dateCompare"
export * from "./dateInfoAtom"
export * from "./dateJSDate"
export * from "./dateOperations"
export { createDate as createNow /* well-known alias */, createDate as getDate /* well-known alias */ }

export type DateParam =
  | MayEnum<
      | `${number}-${number}-${number}`
      | `${number}-${number}-${number} ${number}:${number}`
      | `${number}-${number}-${number} ${number}:${number}:${number}`
    >
  | number /* s */
  | Date
  | JSDate
  | undefined
  | DateInfoAtom

export class Date {
  jsDate: JSDate
  timestamp: number

  /** 一般不用， 使用static from */
  constructor(jsDate: JSDate, timestamp: number) {
    this.jsDate = jsDate
    this.timestamp = timestamp
  }

  /**
   * it use seconds(UNIX timestamp)
   * @example
   * Date.from() //=> now
   * Date.from(1633948800) //=> 2021-10-11T00:00:00.000Z
   * Date.from("2021-10-11") //=> 2021-10-11T00:00:00.000Z
   * Date.from("2021-10-11 12:34:56") //=> 2021-10-11T12:34:56.000Z
   * Date.from({ year: 2021, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56 }) //=> 2021-10-11T12:34:56.000Z
   */
  static from(dateParam?: DateParam): Date {
    function toDate(jsDate: JSDate): Date {
      return new Date(jsDate, jsDate.getTime() / 1000)
    }

    if (dateParam === undefined) return toDate(new JSDate())
    if (isJSDate(dateParam)) return toDate(dateParam)
    if (isDate(dateParam)) return dateParam
    if (isObjectDateInfoAtom(dateParam)) return toDate(transformInfoToJSDate(dateParam as DateInfoAtom))
    if (isNumber(dateParam)) return toDate(new JSDate(dateParam * 1000))
    return dateParam ? toDate(new JSDate(dateParam)) : toDate(new JSDate())
  }

  /** 多数情况下无需使用，因为针对于各个操作总是返回一个新的值。 */
  clone(): Date {
    return Date.from(this.timestamp)
  }

  /** set时间 */
  set(options: Partial<DateInfoAtom>): Date {
    return createDate({
      year: options?.year ?? this.year,
      month: options?.month ?? this.month,
      day: options?.day ?? this.day,
      hours: options?.hours ?? this.hours,
      minutes: options?.minutes ?? this.minutes,
      seconds: options?.seconds ?? this.seconds,
      milliseconds: options?.milliseconds ?? this.milliseconds,
    })
  }

  offset(
    offset: number,
    /** seconds by default */
    options?: {
      unit?: "years" | "months" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
    },
  ): Date {
    if (options?.unit === "months" || options?.unit === "years") {
      const { year, month, day, hours, minutes, seconds, milliseconds } = parseDate(this)
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
      const timestamp = this.timestamp
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
  getDateInfo(): DateInfoFull {
    const info = {
      year: this.year,
      month: this.month,
      day: this.day,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
    }
    return {
      jsDate: this.jsDate,
      dayOfWeek: getDayOfWeek(this),
      timestamp: this.timestamp,
      ...info,
    }
  }

  /** ‘2024-06-12 22:02‘ 里的 2024 */
  get year(): number {
    return this.jsDate.getFullYear()
  }

  /** ‘2024-06-12 22:02‘ 里的 6 */
  get month(): number {
    return this.jsDate.getMonth() + 1
  }

  /** ‘2024-06-12 22:02‘ 里的 12 */
  get day(): number {
    return this.jsDate.getDate()
  }

  /** 星期几，1-7 */
  get dayOfWeek(): number {
    const rawDayOfWeek = this.jsDate.getDay() // 0 - 6 (o 是周日)
    return rawDayOfWeek === 0 ? 7 : rawDayOfWeek
  }

  /** ‘2024-06-12 22:02‘ 里的 22 */
  get hours(): number {
    return this.jsDate.getHours()
  }

  /** ‘2024-06-12 22:02‘ 里的 02 */
  get minutes(): number {
    return this.jsDate.getMinutes()
  }

  /** ‘2024-06-12 22:02:03‘ 里的 03 */
  get seconds(): number {
    return this.jsDate.getSeconds()
  }

  /** ‘2024-06-12 22:02:03.456‘ 里的 456 */
  get milliseconds(): number {
    return this.jsDate.getMilliseconds()
  }

  toJSON() {
    return {
      type: "Date",
      timestamp: this.timestamp,
      jsDate: this.jsDate,
    }
  }
  get [Symbol.toStringTag]() {
    return "Date"
  }
  [Symbol.toPrimitive](hint: "string" | "number" | "default") {
    if (hint === "number") return this.timestamp
    if (hint === "string") return this.jsDate.toISOString()
    return this.jsDate.toISOString()
  }
}

export function isDate(value: any): value is Date {
  return getType(value) === "Date"
}

/**
 * Date.from 的别名
 * it use seconds(UNIX timestamp)
 * @example
 * createDate() //=> now
 * createDate(1633948800) //=> 2021-10-11T00:00:00.000Z
 * createDate("2021-10-11") //=> 2021-10-11T00:00:00.000Z
 * createDate("2021-10-11 12:34:56") //=> 2021-10-11T12:34:56.000Z
 * createDate({ year: 2021, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56 }) //=> 2021-10-11T12:34:56.000Z
 */
export function createDate(dateParam?: DateParam): Date {
  return Date.from(dateParam)
}

/** @deprecated 直接用 Date.timestamp 或 更可读的 {@link getTimestamp} */
export function getTime(value?: DateParam) {
  return createDate(value).timestamp
}

export function getTimestamp(value?: DateParam): number {
  return createDate(value).timestamp
}
/**
 * 这个是整数
 * @example
 * getUnixTime() //=> 1633948800
 */
export function createCurrentUnixTime(): Int {
  return Math.round(getTimestamp())
}

/**
 * timestamp本身可能是小数
 */
export function createCurrentTimestamp(): number {
  return getTimestamp()
}

export function createCurrentDate() {
  return createDate()
}

export function getISO(value?: DateParam) {
  return createDate(value).jsDate.toISOString()
}

export function offsetDateTime(
  baseDate: DateParam,
  offset: number,
  /** milliseconds by default */
  options?: {
    unit?: "years" | "months" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
  },
): Date {
  return createDate(baseDate).offset(offset, options)
}

export type DateInfoFull = Required<DateInfoAtom> & {
  jsDate: globalThis.Date
  dayOfWeek: Int // 0 - 6
  timestamp: number // s
}

/**
 * @param dateParam specified date or today
 * @requires {@link getYear `getYear()`} {@link getMonth `getMonth()`} {@link getDay `getDay()`} {@link getDayOfWeek `getDayOfWeek()`} {@link getHours `getHours()`} {@link getMinutes `getMinutes()`} {@link getSeconds `getSeconds()`} {@link getMilliseconds `getMilliseconds()`} {@link getTimestamp `getTimestamp()`}
 */
export function parseDate(dateParam?: DateParam): DateInfoFull {
  const date = Date.from(dateParam)
  return date.getDateInfo()
}
