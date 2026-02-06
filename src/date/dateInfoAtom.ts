import { isObject } from ".."
import type { Int } from "../typings"
import { isDate } from "./date"
import { isJSDate } from "./dateJSDate"

export type DateInfoAtom = {
  year?: Int
  month?: Int
  day?: Int
  hours?: Int
  minutes?: Int
  seconds?: Int
  milliseconds?: Int
}

export function isObjectDateInfoAtom(value: any): value is DateInfoAtom {
  if (!isObject(value)) return false
  if (isDate(value)) return false
  if (isJSDate(value)) return false
  return true
}
