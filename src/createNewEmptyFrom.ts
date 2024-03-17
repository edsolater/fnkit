import { isArray } from "./dataType"
import { AnyArr, AnyObj } from "./typings/constants"

/**
 * what ever it takes, it return an empty array with same type
 * @example
 * forceEmpty({a:1, b:3}) //=> {}
 * forceEmpty([]) //=>[]
 */
export function createNewEmptyFrom<T extends AnyObj>(obj: T): T
export function createNewEmptyFrom<T extends AnyArr>(arr: T): T
export function createNewEmptyFrom<T>(val: T): T {
  return isArray(val) ? ([] as any) : ({} as any)
}
