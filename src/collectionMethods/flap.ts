import { DeMayArray, DeMayDeepArray, MayArray, MayDeepArray } from '../typings/tools'

/**
 * @example
 * flat([3, [4]]) //=> [3, 4]
 * @todo also add support for Object
 * for example:
 * flat({ a: 3, c:2,  b: {c: 4} }) //=> { a: 3, c: 4 }
 * @version 0.0.1
 */
export default function flap<T extends MayArray<any>>(wrapValue: T, deep = 1): DeMayArray<DeMayArray<T>>[] {
  //@ts-expect-error type force
  return [wrapValue].flat(deep + 1)
}

/**
 * @example
 * flatInfinity([3, [4, [5]]]) //=> [3, 4, 5]
 */
export const flapDeep = <T extends any>(wrapValue: T): DeMayDeepArray<T>[] => [wrapValue].flat(Infinity) as any
