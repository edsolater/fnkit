import { map } from "./collectionMethods"
import { isArray, isObjectLiteral } from "./dataType"

/**
 * clone any data
 * ## flat:
 *    proxy data
 *
 * ## create new:
 *  - object literal
 *  - array literal
 *  - object with [Symbol.clone} method
 *  - primitive value
 *
 * ## delete:
 *  - function
 *  - symbol
 *  - non-enumerable property
 *
 * ## keep:
 *  - Object (e.g. Date)
 *
 * @example
 * clone({ a: 1 }) // { a: 1 }
 */
export function clone(anyData: any): any {
  if (isArray(anyData) || isObjectLiteral(anyData)) {
    return map(anyData, (v) => clone(v))
  } else {
    return anyData
  }
}
