import { DeMayDeepArray } from "../typings/tools"
import { type DeMayArray } from "../mayArray"

/**
 * only array can flat
 * @example
 * flap([3, [4]]) //=> [3, 4]
 * @version 0.0.1
 */
export function flap<A>(wrapValue: A): DeMayArray<DeMayArray<A>>[]
export function flap<A, D extends number = 0>(
  wrapValue: A,
  deth?: D,
): A extends readonly any[] ? (D extends 0 ? A : FlatArray<A, D>[]) : [A]
export function flap<A, D extends number = 0>(wrapValue: A, deth?: D): any {
  if (wrapValue == null) return []
  if (deth === undefined || deth === 0) {
    return Array.isArray(wrapValue) ? wrapValue : [wrapValue]
  } else {
    return [wrapValue].flat(deth + 1)
  }
}

/**
 * @example
 * flapDeep([3, [4, [5]]]) //=> [3, 4, 5]
 */
export const flapDeep = <T extends any>(wrapValue: T) => flap(wrapValue, Infinity) as DeMayDeepArray<T>[]
