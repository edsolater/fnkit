import { isMemberOf } from '../compare'
import { AnyObj, ShakeNever, SValueof } from '../typings'
import filter, { filterEntry, filterKey } from './filter'

type Drop<T, K> = ShakeNever<{
  [P in keyof T]: T[P] extends K ? never : T[P]
}>

/**
 * design for arry and set, object and map
 *
 * it use build-in method `Array.prototype.filter()`
 *
 * accept pairs
 * @param collection collection array or set or object or map
 * @param values value to drop
 * @requires {@link filter `filter()`} {@link split `split()`} {@link isOneOf `isOneOf()`} {@link isArray `isArray()`}
 * @example
 * console.log(drop([5, 2, 9], 2)) // [5, 9]
 * console.log(drop({ a: 3, b: 5 }, 3)) // { b: 5 }
 * console.log(drop({ a: 3, b: 5 }, 3, 5)) // {}
 * @version 0.0.1
 */
export default function drop<T, U>(collection: T[], ...items: U[]): Exclude<T, U>[]
export default function drop<T extends AnyObj, V>(collection: T, ...values: V[]): Drop<T, V>
export default function drop(collection, ...values): any {
  return filter(collection, (v) => !isMemberOf(values, v))
}

export function dropEntry<O extends AnyObj>(collection: O, ...values: SValueof<O>[]) {
  return filterEntry(collection, ([k, v]) => !isMemberOf(values, v))
}

export function dropKey<O extends AnyObj>(collection: O, ...keys: SValueof<O>[]) {
  return filterKey(collection, (k) => !isMemberOf(keys, k))
}
