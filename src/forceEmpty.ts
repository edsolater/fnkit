import { isArray } from './dataType'
import { AnyArr, AnyObj } from './typings/constants'

/**
 * what ever it takes, it return an empty array with same type
 * @example
 * forceEmpty({a:1, b:3}) //=> {}
 * forceEmpty([]) //=>[]
 */
export function forceEmpty<T extends AnyObj>(obj: T): T
export function forceEmpty<T extends AnyArr>(arr: T): T
export function forceEmpty<T>(val: T): T {
  return isArray(val) ? ([] as any) : ({} as any)
}
