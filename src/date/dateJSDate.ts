import { getYear, getMonth, getDay, getHours, getMinutes, getSeconds, getMilliseconds } from "./dateOperations"
import type { DateInfoAtom } from "./dateInfoAtom"
import { Date } from "./date"
import type { Numberish } from "../numberish"

export const JSDate = globalThis.Date
export type JSDate = globalThis.Date
export function isJSDate(value: any): value is JSDate {
  return value instanceof JSDate
}

export function transformInfoToJSDate(dateInfo: DateInfoAtom): JSDate {
  const nowDate = new JSDate()
  return new JSDate(
    dateInfo.year ?? getYear(nowDate),
    dateInfo.month ? dateInfo.month - 1 : getMonth(nowDate) - 1,
    dateInfo.day ?? getDay(nowDate),
    dateInfo.hours ?? getHours(nowDate),
    dateInfo.minutes ?? getMinutes(nowDate),
    dateInfo.seconds ?? getSeconds(nowDate),
    dateInfo.milliseconds ?? getMilliseconds(nowDate),
  )
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
  return new JSDate(currentYear, currentMonthCode + 1, 0).getDate()
}
