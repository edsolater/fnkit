import { type DateParam, getTimestamp } from "./date"

export function isCurrentDateBefore(timestamp: DateParam): boolean {
  return isDateBefore(undefined, timestamp)
}
export function isCurrentDateAfter(timestamp: DateParam): boolean {
  return isDateAfter(undefined, timestamp)
}
export function isSameDate(tested: DateParam, matched?: DateParam | undefined) {
  return getTimestamp(tested) === getTimestamp(matched)
}
export function isDateBefore(tested: DateParam, matched?: DateParam): boolean {
  return getTimestamp(tested) < getTimestamp(matched)
}
export function isDateAfter(tested: DateParam, matched?: DateParam): boolean {
  return getTimestamp(tested) > getTimestamp(matched)
}
