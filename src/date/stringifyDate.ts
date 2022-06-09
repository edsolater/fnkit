import { getISO, createDate, getYear } from './parseDate'
import { TimeStamp } from "./type"

/**
 * @example
 * toUTC() // => '2021-09-09 10:25 UTC'
 * toUTC('Thu,  Number(09) Sep 2021 10:26:33 GMT') // => '2021-09-09 10:25 UTC'
 */
export function toUTC(timestamp?: TimeStamp) {
  const utcString = getISO(timestamp) // '2021-09-09T10:32:32.498Z'
  const matchInfo = utcString.match(/^(?<date>[\d-]+)T(?<hour>\d+):(?<minutes>\d+):(?<seconds>\d+)/)
  const { date, hour, minutes } = matchInfo?.groups ?? {}
  return `${date} ${hour}:${minutes} UTC`
}

export const englishDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
type ChineseDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
export const chineseDayNames: ChineseDayNames = [
  '周日',
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六'
]
export const englishFullMonthNames: [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
type EnglishSimpleMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export const englishSimpleMonthNames: EnglishSimpleMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
export const chineseMonthNames = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月'
]
/** base on 1 */
export const mapToEnglishDay = (dayNumber: number) => englishDayNames[dayNumber] ?? ''
export const mapToChineseDay = (dayNumber: number) => chineseDayNames[dayNumber] ?? ''
/** base on 1 */
export const mapToEnglishSimpleMonth = (monthNumber: number) =>
  englishSimpleMonthNames[(monthNumber + 12 - 1) % 12] ?? ''
/** base on 1 */
export const mapToEnglishFullMonth = (monthNumber: number) =>
  englishFullMonthNames[(monthNumber + 12 - 1) % 12] ?? ''
/** base on 1 */
export const mapToChineseMonth = (monthNumber: number) =>
  chineseMonthNames[(monthNumber + 12 - 1) % 12] ?? ''

export const mapToAmPmHour = (hourNumber: number): { hour: number; flag: string } =>
  hourNumber > 12 ? { hour: hourNumber - 12, flag: 'PM' } : { hour: hourNumber, flag: 'AM' }

  
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
  inputDate: string | number | Date | undefined,
  formatString: string,
  options?: { /** default is 'en' */ weekNameStyle?: 'en' | 'zh-cn' }
) {
  const dateObj = createDate(inputDate)

  return formatString
    .replace('YYYY', `${getYear(dateObj)}`)
    .replace('YY', `${dateObj.getFullYear()}`.slice(2))
    .replace('MM', `${dateObj.getMonth() + 1}`.padStart(2, '0'))
    .replace('M', `${dateObj.getMonth() + 1}`)
    .replace('DD', `${dateObj.getDate()}`.padStart(2, '0'))
    .replace('D', `${dateObj.getDate()}`)
    .replace(
      'dd',
      `${
        options?.weekNameStyle === 'zh-cn'
          ? mapToChineseDay(dateObj.getDay())
          : mapToEnglishDay(dateObj.getDay())
      }`
    )
    .replace('d', `${dateObj.getDay()}`)
    .replace('HH', `${dateObj.getHours()}`.padStart(2, '0'))
    .replace('H', `${dateObj.getHours()}`)
    .replace('hh', `${mapToAmPmHour(dateObj.getHours()).hour}`.padStart(2, '0'))
    .replace('h', `${mapToAmPmHour(dateObj.getHours()).hour}`)
    .replace('mm', `${dateObj.getMinutes()}`.padStart(2, '0'))
    .replace('m', `${dateObj.getMinutes()}`)
    .replace('ss', `${dateObj.getSeconds()}`.padStart(2, '0'))
    .replace('s', `${dateObj.getSeconds()}`)
    .replace('SSS', `${dateObj.getMilliseconds()}`.padStart(3, '0'))
    .replace('A', mapToAmPmHour(dateObj.getMilliseconds()).flag)
    .replace('SSS', mapToAmPmHour(dateObj.getMilliseconds()).flag.toLocaleLowerCase())
}

export const formatDatePresets = {
  normal: 'YYYY-MM-DD HH:mm:ss',
  normalWithoutYears: 'MM-DD HH:mm:ss',
  normalWithoutSeconds: 'YYYY-MM-DD HH:mm',
  genNormalStyle: ({
    withoutYears,
    withoutMonths,
    withoutDate,
    withoutHours,
    withoutMinuts,
    withoutSeconds
  }: {
    withoutYears?: boolean
    withoutMonths?: boolean
    withoutDate?: boolean
    withoutHours?: boolean
    withoutMinuts?: boolean
    withoutSeconds?: boolean
  }) =>
    [
      [
        withoutYears ? undefined : 'YYYY',
        withoutMonths ? undefined : 'MM',
        withoutDate ? undefined : 'DD'
      ].join('-'),
      [withoutHours ? null : 'HH', withoutMinuts ? null : 'mm', withoutSeconds ? null : 'ss'].join(
        ':'
      )
    ].join(' ')
} as const

/**
 * @example
 * extractDate('2020-08-24 18:54') // '08-24'
 * extractDate('2020-08-24 18:54', {year: true}) // '2020-08-24'
 */
 export function extractDate(dateString: string, options?: { year?: boolean }) {
  return formatDate(dateString, options?.year ? 'YYYY-MM-DD' : 'MM-DD')
}

/**
 * @example
 * extractTime('2020-08-24 18:54:32') // '18:54'
 * extractTime('2020-08-24 18:54:32', {milliseconds: true}) // '18:54:32'
 */
export function extractTime(dateString: string, options?: { milliseconds?: boolean }) {
  return formatDate(dateString, options?.milliseconds ? 'HH:mm:ss' : 'HH:mm')
}