import type { Int, MayEnum } from ".."

export type DateInfoAtom = {
  year?: Int
  month?: Int
  day?: Int
  hours?: Int
  minutes?: Int
  seconds?: Int
  milliseconds?: Int
}

export type DateInfoFull = Required<DateInfoAtom> & {
  fullDate: Date
  dayOfWeek: Int // 0 - 6
  timestamp: number // s
  monthLength: Int
}

export type DateParam =
  | MayEnum<
      | `${number}-${number}-${number}`
      | `${number}-${number}-${number} ${number}:${number}`
      | `${number}-${number}-${number} ${number}:${number}:${number}`
    >
  | number /* s */
  | Date
  | undefined
  | DateInfoAtom
export type DateNumber = number /* s */
export type DateString = string
