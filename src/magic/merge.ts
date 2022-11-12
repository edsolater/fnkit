import { every, flap } from '../'
import { mergeObjectsWithConfigs } from '../mergeObjectsWithConfigs'
import { isArray, isFunction, isObject } from '../dataType'
import { AnyArr, AnyFn, AnyObj } from '../typings/constants'

/**
 * a merge version with {@link mergeArrs} and {@link mergeObjs} and {@link mergeFns}
 *
 * auto-deep
 *
 * @example
 * merge([0, 1, 2], ['hello', 'world']) // [ 0, 1, 2, 'hello', 'world' ]
 * merge({a: 3, b: 2}, {a: 1, c: 3}) // {a: 1, b: 2}
 * merge((n) => 3 + n, (n) => 4 * n, () => 5) // (n) => [3+n, 4*n, 5]
 * merge({ a: ['world'], b: 2, c: 1 }, { a: ['hello'], c: 3 }, { c: [10] }) // { a: [ 'world', 'hello' ], b: 2, c: [ 10 ] }
 * @version 0.0.1
 */
export function merge<T extends AnyArr>(...values: T[]): Array<T[number]>
export function merge<T extends AnyFn>(
  ...values: T[]
): (...params: Parameters<T>) => ReturnType<T>[]
export function merge<T extends AnyObj>(...values: T[]): T
export function merge<T>(...values: T[]): unknown[]
export function merge<T>(...values: T[]): any {
  if (every(values, isArray)) return flap(values)
  if (every(values, isFunction))
    //@ts-expect-error force
    return (...args) => values.reduce((returnResults, fn) => returnResults.concat(fn(...args)), [])

  if (every(values, isObject))
    return mergeObjectsWithConfigs(values as object[], ({ valueA: va, valueB: vb }) => merge(va, vb))

  return values[(values as unknown[]).length - 1]
}

export function isEither<T>(...conditions: ((item: T) => boolean)[]): (item: T) => boolean {
  return (item) => conditions.some((fn) => fn(item))
}
export function isAll<T>(...conditions: ((item: T) => boolean)[]): (item: T) => boolean {
  return (item) => conditions.every((fn) => fn(item))
}

/**
 * only accept object
 * @example
 * overwritlyMerge([0, 1, 2], ['hello', 'world']) // [ 'hello', 'world', 2 ]
 * overwritlyMerge({ a: ['world'], b: 2, c: 1 }, { a: ['hello'], c: 3 }, { c: [10] }) // { a: [ 'hello' ], b: 2, c: 3 }
 */
export function overwritlyMerge<T extends AnyObj>(...values: T[]): T {
  if (every(values, isArray))
    //@ts-expect-error force
    return Object.values(values.reduce((acc, cur) => ({ ...acc, ...cur }), {} as T))
  return values.reduce((acc, cur) => ({ ...acc, ...cur }), {} as T)
}

// console.log(merge([0, 1, 2], ['hello', 'world'])) // [ 0, 1, 2, 'hello', 'world' ]
// console.log(merge({ a: 3, b: 2 }, { a: 1, c: 3 })) // {a: 1, b: 2}
// console.log(
//   merge(
//     (n) => 3 + n,
//     (n) => 4 * n,
//     () => 5
//   )
// ) // (n) => [3+n, 4*n, 5]
// console.log(merge({ a: ['world'], b: 2, c: 1 }, { a: ['hello'], c: 3 }, { c: [10] })) // { a: [ 'world', 'hello' ], b: 2, c: [ 10 ] }
