import { DeMayArray, DeMayDeepArray, MayArray } from "../typings/tools"

/**
 * only array can flat
 * @example
 * flat([3, [4]]) //=> [3, 4]
 * @version 0.0.1
 */
export function flap<T extends MayArray<any>>(wrapValue: T, deep = 0): DeMayArray<DeMayArray<T>>[] {
  if (wrapValue == null) return []

  if (deep === 0) {
    //@ts-expect-error type force
    return Array.isArray(wrapValue) ? wrapValue : [wrapValue]
  } else {
    //@ts-expect-error type force
    return [wrapValue].flat(deep + 1)
  }
}

/**
 * @example
 * flatInfinity([3, [4, [5]]]) //=> [3, 4, 5]
 */
export const flapDeep = <T extends any>(wrapValue: T) => flap(wrapValue, Infinity) as DeMayDeepArray<T>[]
