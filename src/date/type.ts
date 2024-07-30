import { Numberish } from "../numberish/types"


/** @deprecated use {@link TimeSStampVerbose} instead, second-base is standard, millisecond-base is just javascript language */
export type TimeStampVerbose = TimeStamp | TimeStampString | Date
export type TimeSStampVerbose = TimeSStamp | TimeStampString | Date
export type TimeSStamp = number // (s)
/** @deprecated use {@link TimeSStamp} instead, second-base is standard, millisecond-base is just javascript language */
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

export type DateParam = string | number | Date | undefined | DateInfoAtom
export type DateNumber = number
export type DateString = string
