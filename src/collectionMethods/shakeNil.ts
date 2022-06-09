import { isExist, isTruthy } from '../dataType'
import { NeverKeys, NonFalsy } from '../typings'
import filter from './filter'

type ShakeNeverValue<O> = Omit<O, NeverKeys<O>>

/**
 * for array and object and set and map
 */
export function shakeNil<C>(arr: C[]): NonNullable<C>[]
export function shakeNil<T>(obj: T): ShakeNeverValue<{ [K in keyof T]: NonNullable<T[K]> }>
export function shakeNil(target) {
  return filter(target, isExist)
}

/**
 * for array and object and set and map
 */
export function shakeFalsy<C>(arr: C[]): NonFalsy<C>[]
export function shakeFalsy<T>(obj: T): ShakeNeverValue<{ [K in keyof T]: NonFalsy<T[K]> }>
export function shakeFalsy(target) {
  return filter(target, isTruthy)
}

export function unified<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}
