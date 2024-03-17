import { DeMayDeepArray, MayArray } from "../typings/tools"

/**
 * only array can flat
 * @example
 * flat([3, [4]]) //=> [3, 4]
 * @version 0.0.1
 */
export function flap<A, D extends number = 0>(
  wrapValue: A,
  deth?: D,
): A extends readonly any[] ? (D extends 0 ? A : FlatArray<A, D>[]) : [A] {
  //@ts-expect-error type force
  if (wrapValue == null) return []

  if (deth === undefined || deth === 0) {
    //@ts-expect-error type force
    return Array.isArray(wrapValue) ? wrapValue : [wrapValue]
  } else {
    //@ts-expect-error type force
    return [wrapValue].flat(deth + 1)
  }
}
type AddOne<N> = N extends 1
  ? 2
  : N extends 2
  ? 3
  : N extends 3
  ? 4
  : N extends 4
  ? 5
  : N extends 5
  ? 6
  : N extends 6
  ? 7
  : N extends 7
  ? 8
  : N extends 8
  ? 9
  : N extends 9
  ? 10
  : N extends 10
  ? 11
  : N extends 11
  ? 12
  : N extends 12
  ? 13
  : N extends 13
  ? 14
  : N extends 14
  ? 15
  : N extends 15
  ? 16
  : N extends 16
  ? 17
  : N extends 17
  ? 18
  : N extends 18
  ? 19
  : N extends 19
  ? 20
  : N extends 20
  ? 21
  : N extends 21
  ? 22
  : N extends 22
  ? 23
  : N extends 23
  ? 24
  : N extends 24
  ? 25
  : N extends 25
  ? 26
  : N extends 26
  ? 27
  : N extends 27
  ? 28
  : N extends 28
  ? 29
  : N extends 29
  ? 30
  : number
/**
 * @example
 * flatInfinity([3, [4, [5]]]) //=> [3, 4, 5]
 */
export const flapDeep = <T extends any>(wrapValue: T) => flap(wrapValue, Infinity) as DeMayDeepArray<T>[]