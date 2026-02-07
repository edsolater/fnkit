import { Date, type DateParam, type Zone, createDate } from "./date"

/**
 * this month number is base on 1. (e.g. 1 => January)
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */

export function getMonth(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).month
}

/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getYear(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).year
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDay(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).day
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getDayOfWeek(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).dayOfWeek
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getHours(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).hours
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMinutes(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).minutes
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getSeconds(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).seconds
}
/**
 * @param date specified date or today
 * @requires {@link createDate `createDate()`}
 */
export function getMilliseconds(date?: DateParam, zone?: Zone) {
  return createDate(date, zone).milliseconds
}
