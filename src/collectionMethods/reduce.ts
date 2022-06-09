import { AnyObj, isArray } from '../'
import { SKeyof, SValueof } from '../typings'

export function reduce<T, U>(
  arr: T[],
  callbackFn: (acc: U, item: T, index: number, arr: readonly T[]) => U,
  initialValue: U
): U
export function reduce<O extends AnyObj, F>(
  obj: O,
  callbackFn: (acc: F, value: SValueof<O>, key: SKeyof<O>) => F,
  initialValue: F
): F
export function reduce(collection, callbackFn, initialValue) {
  return isArray(collection)
    ? reduceItem(collection, callbackFn, initialValue)
    : // @ts-expect-error
      reduceItem(collection, (acc, [key, value]) => [key, callbackFn(acc, value, key)], ['tempKey', initialValue])[1]
}

/** just use reduce  */
export function reduceItem<T, U>(
  arr: readonly T[],
  callbackFn: (acc: U, item: T, index: number, arr: readonly T[]) => U,
  initialValue: U
): U {
  return arr.reduce(callbackFn, initialValue)
}

/**
 * usually do not use this fn, for **not straightforward**
 */
export function reduceEntry<O extends AnyObj, F extends [string, any]>(
  obj: O,
  callbackFn: (acc: F, entry: [key: SKeyof<O>, value: SValueof<O>]) => F,
  initialValue: F
): F {
  return (
    // @ts-expect-error
    Object.entries(obj).reduce((acc, entry) => callbackFn(acc, entry), initialValue) as F
  )
}

export function reduceKey<O extends AnyObj, F>(obj: O, callbackFn: (acc: F, key: SKeyof<O>) => F, initialValue: F): F {
  return (
    // @ts-expect-error
    Object.keys(obj).reduce((acc, key) => callbackFn(acc, key), initialValue) as F
  )
}
