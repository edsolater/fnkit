import { Date, type DateParam, createDate } from "./date"

/**
 * this month number is base on 1. (e.g. 1 => January)
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */

export function getMonth(date?: DateParam) {
  return createDate(date).jsDate.getMonth() + 1
}
export function setMonth(date: DateParam, /* start from 1 */ monthNumber: number) {
  const newDate = Date.from(date).clone()
  newDate.jsDate.setMonth(monthNumber - 1)
  return newDate
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getYear(date?: DateParam) {
  return createDate(date).jsDate.getFullYear()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDay(date?: DateParam) {
  return createDate(date).jsDate.getDate()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDayOfWeek(date?: DateParam) {
  return createDate(date).jsDate.getDay()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getHours(date?: DateParam) {
  return createDate(date).jsDate.getHours()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMinutes(date?: DateParam) {
  return createDate(date).jsDate.getMinutes()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getSeconds(date?: DateParam) {
  return createDate(date).jsDate.getSeconds()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMilliseconds(date?: DateParam) {
  return createDate(date).jsDate.getMilliseconds()
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
