import { isObject } from "../dataType"
import { shakeTailingZero } from "../numberish/trimZero"
import { shrinkToValue } from "../wrapper"
import { parseDuration } from "./parseDuration"
import { ParsedDurationInfo } from "./type"

/**
 * date format string list (case insensitive)):
 *
 * d 	  1-31	 (day)
 * h 	  0-23	(hour)
 * m	  0-59	(minutes)
 * s   	0-59	(seconds)
 * dd 	  01-31	 (day)
 * hh 	  00-23	(hour)
 * mm	  00-59	(minutes)
 * ss   	00-59	(seconds)
 * sss  000-999	(milliseconds)
 * @example
 * formatDate(1000 * 60 * 60 * 24, 'D Days H Hours') // '1 Days 0 Hours'
 * formatDate(6500, 's Seconds sss Milliseconds') // '6 Seconds 500 Milliseconds'
 * formatDate(6500, 's.sss Seconds') // '6.500 Seconds'
 * formatDate(6500, 's.sss Seconds', {shakeMillisecondsTailingZero: true}) // '6.5 Seconds'
 */
export function formatDuration(
  parsedDurationInfo: ParsedDurationInfo | number /* ms */,
  formatString: string | ((durationInfo: ParsedDurationInfo) => string),
  options?: {
    shakeMillisecondsTailingZero?: boolean
  },
) {
  const durationInfo = parseDuration(isObject(parsedDurationInfo) ? parsedDurationInfo.full : parsedDurationInfo)
  return ` ${shrinkToValue(formatString, [durationInfo])} `
    .replace(/(\W+)[d](\W+)/gi, `$1${durationInfo.days}$2`)
    .replace(/(\W+)[dd](\W+)/gi, `$1${String(durationInfo.days).padStart(2, "0")}$2`)
    .replace(/(\W+)[h](\W+)/gi, `$1${durationInfo.hours}$2`)
    .replace(/(\W+)[hh](\W+)/gi, `$1${String(durationInfo.hours).padStart(2, "0")}$2`)
    .replace(/(\W+)[m](\W+)/gi, `$1${durationInfo.minutes}$2`)
    .replace(/(\W+)[mm](\W+)/gi, `$1${String(durationInfo.minutes).padStart(2, "0")}$2`)
    .replace(/(\W+)[s](\W+)/gi, `$1${durationInfo.seconds}$2`)
    .replace(/(\W+)[ss](\W+)/gi, `$1${String(durationInfo.seconds).padStart(2, "0")}$2`)
    .replace(
      /(\W+)[sss](\W+)/gi,
      `$1${
        options?.shakeMillisecondsTailingZero
          ? shakeTailingZero(String(durationInfo.milliseconds).padStart(3, "0"))
          : String(durationInfo.milliseconds).padStart(3, "0")
      }$2`,
    )
    .trim()
}
