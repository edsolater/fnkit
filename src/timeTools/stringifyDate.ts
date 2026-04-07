import { isObject, isString, type PartRequired } from ".."
import { createCurrentDate, createDate, getISO, type DateParam, type Zone } from "./date"
import { getYear } from "./dateOperations"
import { TimeStampVerbose } from "./parseDuration.type"

/**
 * @example
 * toUTC() // => '2021-09-09 10:25 UTC'
 * toUTC('Thu,  Number(09) Sep 2021 10:26:33 GMT') // => '2021-09-09 10:25 UTC'
 */
export function toUTC(timestamp?: TimeStampVerbose) {
  const utcString = getISO(timestamp) // '2021-09-09T10:32:32.498Z'
  const matchInfo = utcString.match(/^(?<date>[\d-]+)T(?<hour>\d+):(?<minutes>\d+):(?<seconds>\d+)/)
  const { date, hour, minutes } = matchInfo?.groups ?? {}
  return `${date} ${hour}:${minutes} UTC`
}

export const englishDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
type EnglishDayName = typeof englishDayNames[number]
export const chineseDayNames= ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] as const
type ChineseDayName = typeof chineseDayNames[number]
export const englishFullMonthNames: [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
type EnglishSimpleMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const englishSimpleMonthNames: EnglishSimpleMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
export const chineseMonthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
]
/** base on 1 */
export const mapToEnglishDay = (dayNumber: number) => englishDayNames[dayNumber] ?? ""
export const mapToChineseDay = (dayNumber: number) => chineseDayNames[dayNumber] ?? ""
/** base on 1 */
export const mapToEnglishSimpleMonth = (monthNumber: number) =>
  englishSimpleMonthNames[(monthNumber + 12 - 1) % 12] ?? ""
/** base on 1 */
export const mapToEnglishFullMonth = (monthNumber: number) => englishFullMonthNames[(monthNumber + 12 - 1) % 12] ?? ""
/** base on 1 */
export const mapToChineseMonth = (monthNumber: number) => chineseMonthNames[(monthNumber + 12 - 1) % 12] ?? ""

export const mapToAmPmHour = (hourNumber: number): { hour: number; flag: string } =>
  hourNumber > 12 ? { hour: hourNumber - 12, flag: "PM" } : { hour: hourNumber, flag: "AM" }

   
export type FormatDateOptions = {
  zone?: Zone
  /** default is 'YYYY-MM-DD HH:mm:ss' */
  formatString?: string
  /** default is 'en' */
  weekNameStyle?: "en" | "zh-cn"
}
/**
 * date format string list:
 *
 * YYYY	2018	(year)
 * YY	  18	  (year)
 * MM	  01-12 (mounth)
 * M	    1-12	(mounth)
 * DD	  01-31	 (day)
 * D 	  1-31	 (day)
 * dd	  Sun / Mon / Tue / Wed / Thu / Fri / Sat (day)
 * d	    0-6	 (week)
 * HH	  00-23	(hour)
 * H 	  0-23	(hour)
 * hh	  01-12	(hour)
 * h   	1-12	(hour)
 * mm  	00-59	(minutes), 2-digits
 * m	    0-59	(minutes)
 * ss  	00-59	(seconds), 2-digits
 * s   	0-59	(seconds)
 * SSS	  000-999	(milliseconds), 3-digits
 * A	    AM PM
 * a	    am pm
 * @example
 * formatDate('2020-08-24 18:54', 'YYYY-MM-DD HH:mm:ss') // 2020-08-24 18:54:00
 */

export function formatDate(
  inputDate: DateParam,
  formatString?: string,
  options?: FormatDateOptions,
) 
export function formatDate(
  inputDate: DateParam,
  options?: FormatDateOptions,
) 
export function formatDate(
  inputDate: DateParam,
  formatString?: string | FormatDateOptions,
  inputOptions?: FormatDateOptions,
) {
  const options = (() => {
    const defaultFormatString = "YYYY-MM-DD HH:mm:ss"
    if (isObject(formatString)) {
      return {formatString: defaultFormatString, ...formatString , ...inputOptions} 
    }else if (isString(formatString)) {
      return { formatString, ...inputOptions} 
    } else {
      return { formatString: defaultFormatString }
    }
  })() satisfies PartRequired<FormatDateOptions, "formatString">

  const date = createDate(inputDate, options.zone)

  return options.formatString
    .replace("YYYY", `${getYear(date)}`)
    .replace("YY", `${date.year}`.slice(2))
    .replace("MM", `${date.month}`.padStart(2, "0"))
    .replace("M", `${date.month}`)
    .replace("DD", `${date.day}`.padStart(2, "0"))
    .replace("D", `${date.day}`)
    .replace(
      "dd",
      `${options?.weekNameStyle === "zh-cn" ? mapToChineseDay(date.dayOfWeek) : mapToEnglishDay(date.dayOfWeek)}`,
    )
    .replace("d", `${date.dayOfWeek}`)
    .replace("HH", `${date.hours}`.padStart(2, "0"))
    .replace("H", `${date.hours}`)
    .replace("hh", `${mapToAmPmHour(date.hours).hour}`.padStart(2, "0"))
    .replace("h", `${mapToAmPmHour(date.hours).hour}`)
    .replace("mm", `${date.minutes}`.padStart(2, "0"))
    .replace("m", `${date.minutes}`)
    .replace("ss", `${date.seconds}`.padStart(2, "0"))
    .replace("s", `${date.seconds}`)
    .replace("SSS", `${date.milliseconds}`.padStart(3, "0"))
    .replace("A", mapToAmPmHour(date.hours).flag)
    .replace("a", mapToAmPmHour(date.hours).flag.toLocaleLowerCase())
}

export const formatDatePresets = {
  normal: "YYYY-MM-DD HH:mm:ss",
  normalWithoutYears: "MM-DD HH:mm:ss",
  normalWithoutSeconds: "YYYY-MM-DD HH:mm",
  genNormalStyle: ({
    withoutYears,
    withoutMonths,
    withoutDate,
    withoutHours,
    withoutMinuts,
    withoutSeconds,
  }: {
    withoutYears?: boolean
    withoutMonths?: boolean
    withoutDate?: boolean
    withoutHours?: boolean
    withoutMinuts?: boolean
    withoutSeconds?: boolean
  }) =>
    [
      [withoutYears ? undefined : "YYYY", withoutMonths ? undefined : "MM", withoutDate ? undefined : "DD"].join("-"),
      [withoutHours ? null : "HH", withoutMinuts ? null : "mm", withoutSeconds ? null : "ss"].join(":"),
    ].join(" "),
} as const

/**
 * @example
 * extractDate('2020-08-24 18:54') // '08-24'
 * extractDate('2020-08-24 18:54', {year: true}) // '2020-08-24'
 */
export function extractDate(dateString: string, options?: { year?: boolean }) {
  return formatDate(dateString, options?.year ? "YYYY-MM-DD" : "MM-DD")
}

/**
 * @example
 * extractTime('2020-08-24 18:54:32') // '18:54'
 * extractTime('2020-08-24 18:54:32', {milliseconds: true}) // '18:54:32'
 */
export function extractTime(dateString: string, options?: { milliseconds?: boolean }) {
  return formatDate(dateString, options?.milliseconds ? "HH:mm:ss" : "HH:mm")
}
 
/** 快速表达：时间戳 -> 日期字符串 
 * 内部调用 {@link formatDate} */
export function toDateString(timestamp: TimeStampVerbose, options?: FormatDateOptions) {
  return formatDate(timestamp, options)
}
/**
 *
 * @example
 * createCurrentDateTimeStr() //=> '2021-09-09 10:25:33'
 */
export const createCurrentDateTimeStr = () => formatDate(createCurrentDate(), "YYYY-MM-DD HH:mm:ss")

/**
 *
 * @example
 * createCurrentDateStr() //=> '2021-09-09'
 */
export const createCurrentDateStr = () => formatDate(createCurrentDate(), "YYYY-MM-DD")

/**
 *
 * @example
 * createCurrentTimeStr() //=> '10:25:33'
 */
export const createCurrentTimeStr = (options?: { ms?: boolean }) => {
  if (options?.ms) {
    return formatDate(createCurrentDate(), "HH:mm:ss.SSS")
  } else {
    return formatDate(createCurrentDate(), "HH:mm:ss")
  }
}
