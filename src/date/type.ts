import { Numberish } from "../numberish/types"

export type TimeStampVerbose = TimeStamp | TimeStampString | Date
export type TimeStamp = number // (ms)
export type TimeStampString = string

export type ParsedDurationInfo = Record<
  "days" | "hours" | "minutes" | "seconds" | "milliseconds" | "full" | "exact",
  number
>

export type DateInfoAtom = {
  year?: Numberish
  month?: Numberish
  calendarDate?: Numberish
  hours?: Numberish
  minutes?: Numberish
  seconds?: Numberish
  milliseconds?: Numberish
}

export type DateParam = string | number /* s */ | Date | undefined | DateInfoAtom
export type DateNumber = number /* s */
export type DateString = string
