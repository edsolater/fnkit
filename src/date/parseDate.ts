import { clamp, map, Numberish } from '..'
import { getType } from '../dataType'
import { DateParam, DateInfoAtom, TimeStamp } from './type'

export const createDate: {
  (): Date
  (value: DateParam): Date
  (
    year: Numberish,
    month: Numberish,

    calendarDate: Numberish,
    hours?: Numberish,
    minutes?: Numberish,
    seconds?: Numberish,
    milliseconds?: Numberish
  ): Date
} = (...params) => {
  if (params.length === 0) {
    return new Date()
  } else if (params.length === 1) {
    const value = params[0]
    if (value instanceof Date) {
      return new Date(value)
    } else if (getType(value) === 'Object') {
      const nowDate = new Date()
      const {
        year = getYear(nowDate),
        month = getMonth(nowDate),
        calendarDate = getCalendarDate(nowDate),
        hours = getHours(nowDate),
        minutes = getMinutes(nowDate),
        seconds = getSeconds(nowDate),
        milliseconds = getMilliseconds(nowDate)
      } = map(value as DateInfoAtom, Number)
      return new Date(year, month - 1, calendarDate, hours, minutes, seconds, milliseconds)
    }
    return value ? new Date(value) : new Date()
  } else {
    const [year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0] = params.map((i) => Number(i))
    const monthLength = getMonthLength(year, month)
    return new Date(year, month - 1, clamp(0, day, monthLength), hours, minutes, seconds, milliseconds)
  }
}

export function setDate(oldDate: DateParam, options?: DateInfoAtom) {
  return createDate({
    year: options?.year ?? getYear(oldDate),
    month: options?.month ?? getMonth(oldDate),
    calendarDate: options?.calendarDate ?? getCalendarDate(oldDate),
    hours: options?.hours ?? getHours(oldDate),
    minutes: options?.minutes ?? getMinutes(oldDate),
    seconds: options?.seconds ?? getSeconds(oldDate),
    milliseconds: options?.milliseconds ?? getMilliseconds(oldDate)
  })
}

export const getTime = (value?: DateParam) => createDate(value).getTime()
export const getISO = (value?: DateParam) => createDate(value).toISOString()

// same as createDate, useful for readibility
export const createCurrentDate = () => createDate()
export const createCurrentTimestamp = () => getTime()

export const isCurrentDateBefore = (timestamp: TimeStamp): boolean => isDateBefore(undefined, timestamp)
export const isCurrentDateAfter = (timestamp: TimeStamp): boolean => isDateAfter(undefined, timestamp)
export const isSameDate = (tested: TimeStamp, matched?: TimeStamp | undefined) => getTime(tested) === getTime(matched)

export const isDateBefore = (tested: string | number | Date | undefined, matched?: string | number | Date): boolean =>
  getTime(tested) < getTime(matched)
export const isDateAfter = (tested: string | number | Date | undefined, matched?: string | number | Date): boolean =>
  getTime(tested) > getTime(matched)

export function offsetDateTime(
  baseDate: DateParam,
  offset: number,
  /** milliseconds by default */
  options?: {
    unit?: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
  }
) {
  if (options?.unit === 'months' || options?.unit === 'years') {
    const { year, month, calendarDate, hours, minutes, seconds, milliseconds } = getFullDateInfo(baseDate)
    const wiredTotalMonth = year * 12 + month + offset * (options?.unit === 'months' ? 1 : 12)
    const yearNumber = Math.floor(wiredTotalMonth / 12)
    const monthNumber = wiredTotalMonth % 12
    return createDate(yearNumber, monthNumber, calendarDate, hours, minutes, seconds, milliseconds)
  } else {
    const timestamp = getTime(baseDate)
    const offsetedTimestamp =
      timestamp +
      (options?.unit === 'days'
        ? offset * 24 * 60 * 60 * 1000
        : options?.unit === 'hours'
        ? offset * 60 * 60 * 1000
        : options?.unit === 'minutes'
        ? offset * 60 * 1000
        : options?.unit === 'seconds'
        ? offset * 1000
        : offset)
    return createDate(offsetedTimestamp)
  }
}

export const cloneDate = (date: DateParam) => createDate(getTime(date))
/**
 * this month number is base on 1. (e.g. 1 => January)
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getMonth = (date?: DateParam) => createDate(date).getMonth() + 1
export const setMonth = (date: DateParam, /* start from 1 */ monthNumber: number) => {
  const newDate = cloneDate(date)
  newDate.setMonth(monthNumber - 1)
  return newDate
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getYear = (date?: DateParam) => createDate(date).getFullYear()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getCalendarDate = (date?: DateParam) => createDate(date).getDate()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getDayOfWeek = (date?: DateParam) => createDate(date).getDay()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getHours = (date?: DateParam) => createDate(date).getHours()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getMinutes = (date?: DateParam) => createDate(date).getMinutes()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getSeconds = (date?: DateParam) => createDate(date).getSeconds()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getMilliseconds = (date?: DateParam) => createDate(date).getMilliseconds()

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export const getTimestamp = (date?: DateParam) => createDate(date).getTime()

/**
 * @param date specified date or today
 * @requires {@link getYear `getYear()`} {@link getMonth `getMonth()`} {@link getCalendarDate `getDate()`} {@link getDayOfWeek `getDay()`} {@link getHours `getHours()`} {@link getMinutes `getMinutes()`} {@link getSeconds `getSeconds()`} {@link getMilliseconds `getMilliseconds()`} {@link getTimestamp `getTimestamp()`} {@link getMonthLength `getMonthLength()`}
 */
export const getFullDateInfo = (date?: DateParam) => {
  const paramDate = createDate(date)
  return {
    date: paramDate,
    year: getYear(paramDate),
    month: getMonth(paramDate),
    calendarDate: getCalendarDate(paramDate),
    dayOfWeek: getDayOfWeek(paramDate),
    hours: getHours(paramDate),
    minutes: getMinutes(paramDate),
    seconds: getSeconds(paramDate),
    milliseconds: getMilliseconds(paramDate),
    timestamp: getTimestamp(paramDate),
    monthLength: getMonthLength(getYear(paramDate), getMonth(paramDate))
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
