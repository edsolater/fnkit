export type TimeStampVerbose = TimeStamp | TimeStampString | Date
export type TimeStamp = number // (ms)

export type TimeStampString = string

export type DurationInfo = {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  full: number
  exact: number
}
