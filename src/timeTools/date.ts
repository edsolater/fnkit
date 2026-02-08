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
export type Zone = "UTC" | "local"
export let dateZone: Zone = "local" // 'UTC' | 'local'

/** 【配置修改器】更改全局配置 */
export function configDateZone(zone: Zone) {
  dateZone = zone
}

export class Date {
  zone: Zone
  jsDate: JSDate
  timestamp: number

  /** 一般不用， 使用static from */
  constructor(jsDate: JSDate, timestamp: number, zone: Zone = dateZone) {
    this.jsDate = jsDate
    this.timestamp = timestamp
    this.zone = zone
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
  static from(dateParam?: DateParam, zone: Zone = dateZone): Date {
    function toDate(jsDate: JSDate): Date {
      return new Date(jsDate, jsDate.getTime() / 1000, zone)
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
    return Date.from(this.timestamp, this.zone)
  }

  /** set时间 */
  set(options: Partial<DateInfoAtom> & { zone?: Zone }): Date {
    return Date.from(
      {
        year: options?.year ?? this.year,
        month: options?.month ?? this.month,
        day: options?.day ?? this.day,
        hours: options?.hours ?? this.hours,
        minutes: options?.minutes ?? this.minutes,
        seconds: options?.seconds ?? this.seconds,
        milliseconds: options?.milliseconds ?? this.milliseconds,
      },
      options.zone ?? this.zone,
    )
  }

  /** 偏移时间 */
  offset(
    offset: number,
    /** seconds by default */
    options?: {
      unit?: "years" | "months" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
    },
  ): Date {
    if (options?.unit === "months" || options?.unit === "years") {
      const { year, month, day, hours, minutes, seconds, milliseconds } = this.getDateInfo()
      const wiredTotalMonth = year * 12 + month + offset * (options?.unit === "months" ? 1 : 12)
      const yearNumber = Math.floor(wiredTotalMonth / 12)
      const monthNumber = wiredTotalMonth % 12
      return Date.from(
        {
          year: yearNumber,
          month: monthNumber,
          day,
          hours,
          minutes,
          seconds,
          milliseconds,
        },
        this.zone,
      )
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
      return Date.from(offsetedTimestampSeconds, this.zone)
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
    return this.zone === "UTC" ? this.jsDate.getUTCFullYear() : this.jsDate.getFullYear()
  }

  /** ‘2024-06-12 22:02‘ 里的 6 */
  get month(): number {
    const jsDateMounth = this.zone === "UTC" ? this.jsDate.getUTCMonth() : this.jsDate.getMonth()
    return jsDateMounth + 1
  }

  /** ‘2024-06-12 22:02‘ 里的 12 */
  get day(): number {
    return this.zone === "UTC" ? this.jsDate.getUTCDate() : this.jsDate.getDate()
  }

  /** 星期几，1-7 */
  get dayOfWeek(): number {
    const rawDayOfWeek = this.zone === "UTC" ? this.jsDate.getUTCDay() : this.jsDate.getDay() // 0 - 6 (0 是周日)
    return rawDayOfWeek === 0 ? 7 : rawDayOfWeek
  }

  /** ‘2024-06-12 22:02‘ 里的 22 */
  get hours(): number {
    return this.zone === "UTC" ? this.jsDate.getUTCHours() : this.jsDate.getHours()
  }

  /** ‘2024-06-12 22:02‘ 里的 02 */
  get minutes(): number {
    return this.zone === "UTC" ? this.jsDate.getUTCMinutes() : this.jsDate.getMinutes()
  }

  /** ‘2024-06-12 22:02:03‘ 里的 03 */
  get seconds(): number {
    return this.zone === "UTC" ? this.jsDate.getUTCSeconds() : this.jsDate.getSeconds()
  }

  /** ‘2024-06-12 22:02:03.456‘ 里的 456 */
  get milliseconds(): number {
    return this.zone === "UTC" ? this.jsDate.getUTCMilliseconds() : this.jsDate.getMilliseconds()
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
export function createDate(dateParam?: DateParam, zone?: Zone): Date {
  return Date.from(dateParam, zone)
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
export function createCurrentUnixTime(zone?: Zone): Int {
  return Math.round(getTimestamp())
}

/**
 * timestamp本身可能是小数
 */
export function createCurrentTimestamp(): number {
  return getTimestamp()
}

export function createCurrentDate(zone?: Zone) {
  return createDate(undefined, zone)
}

export function getISO(value?: DateParam, zone?: Zone) {
  return createDate(value, zone).jsDate.toISOString()
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
export function parseDate(dateParam?: DateParam, zone?: Zone): DateInfoFull {
  const date = Date.from(dateParam, zone)
  return date.getDateInfo()
}

