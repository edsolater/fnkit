import { isObject } from "../dataType"
import { shakeTailingZero } from "../numberish/trimZero"
import { shrinkFn } from "../wrapper"
import { parseTimeTypeToSeconds, type TimeType } from "./buildinTimeUtils"
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
 * formatDate(60 * 60 * 24, 'D Days H Hours') // '1 Days 0 Hours'
 * formatDate(6.5, 's Seconds sss Milliseconds') // '6 Seconds 500 Milliseconds'
 * formatDate(6.5, 's Seconds') // '6 Seconds'
 * formatDate(6.5) // '6 Seconds 500 Milliseconds'
 */
export function formatDuration(
  timeType: TimeType,
  rawFormatString?: string | ((durationInfo: ParsedDurationInfo) => string),
  options?: {
    shakeMillisecondsTailingZero?: boolean
  },
) {
  const parsedDurationInfo = parseDuration(parseTimeTypeToSeconds(timeType))
  const durationInfo = parseDuration(isObject(parsedDurationInfo) ? parsedDurationInfo.full : parsedDurationInfo)
  const autoFormatString = (() => {
    if (rawFormatString) return undefined
    let s = " "
    if (durationInfo.days) s += "D Days "
    if (durationInfo.hours) s += "H Hours "
    if (durationInfo.minutes) s += "M Minutes "
    if (durationInfo.seconds) s += "S Seconds "
    if (durationInfo.milliseconds) s += "MS Milliseconds "
    return s
  })()
  const formatString = shrinkFn(rawFormatString ?? autoFormatString!, [durationInfo])
  return formatString
    .replace(/(?<=\s+)d(?=\s+)/gi, `${durationInfo.days}`)
    .replace(/(?<=\s+)dd(?=\s+)/gi, `${String(durationInfo.days).padStart(2, "0")}`)
    .replace(/(?<=\s+)h(?=\s+)/gi, `${durationInfo.hours}`)
    .replace(/(?<=\s+)hh(?=\s+)/gi, `${String(durationInfo.hours).padStart(2, "0")}`)
    .replace(/(?<=\s+)m(?=\s+)/gi, `${durationInfo.minutes}`)
    .replace(/(?<=\s+)mm(?=\s+)/gi, `${String(durationInfo.minutes).padStart(2, "0")}`)
    .replace(/(?<=\s+)s(?=\s+)/gi, `${durationInfo.seconds}`)
    .replace(/(?<=\s+)ss(?=\s+)/gi, `${String(durationInfo.seconds).padStart(2, "0")}`)
    .replace(
      /(?<=\s+)sss|ms(?=\s+)/gi,
      `${
        options?.shakeMillisecondsTailingZero
          ? shakeTailingZero(String(durationInfo.milliseconds).padStart(3, "0"))
          : String(durationInfo.milliseconds).padStart(3, "0")
      }`,
    )
    .trim()
}
