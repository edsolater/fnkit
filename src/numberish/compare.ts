import { isNumber, isBigInt } from '../dataType'
import { Numberish } from './types'
import { ZeroBigint } from './constant'
import { toNumberishAtom } from './numberishAtom'
import { minus } from './operations'

/**
 * @example
 * greaterThan(2,3) //=> false
 * greaterThan('3', 3) //=> false
 * greaterThan('4', 3) //=> true
 */
export function greaterThan(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  if ((isNumber(a) || isBigInt(a)) && (isNumber(b) || isBigInt(b))) return a > b
  const diff = minus(a, b)
  const ab = toNumberishAtom(diff).numerator
  return BigInt(ab) > BigInt(0)
}
export const gt = greaterThan

/**
 * @example
 * lessThanOrEqual(2,3) //=> true
 * lessThanOrEqual('3', 3) //=> true
 * lessThanOrEqual('4', 3) //=> false
 */
export function lessThanOrEqual(a: Numberish | undefined, b: Numberish | undefined): boolean {
  return !greaterThan(a, b)
}
export const lte = lessThanOrEqual

/**
 * @example
 * lessThan(2,3) //=> true
 * lessThan('3', 3) //=> false
 * lessThan('4', 3) //=> false
 */
export function lessThan(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  if ((isNumber(a) || isBigInt(a)) && (isNumber(b) || isBigInt(b))) return a < b
  const diff = minus(a, b)
  const ab = toNumberishAtom(diff).numerator
  return ab < 0
}
export const lt = lessThan

/**
 * @example
 * greaterThanOrEqual(2,3) //=> false
 * greaterThanOrEqual('3', 3) //=> true
 * greaterThanOrEqual('4', 3) //=> true
 */
export function greaterThanOrEqual(a: Numberish | undefined, b: Numberish | undefined): boolean {
  return !lessThan(a, b)
}
export const gte = greaterThanOrEqual

/**
 *
 * @example
 * equal(2,3) //=> false
 * equal('3', 3) //=> true
 * equal('3.0', 3) //=> true
 * equal('.3', 3) //=> false
 * equal('-3.0', -3) //=> true
 */
export function equal(a: Numberish | undefined, b: Numberish | undefined): boolean {
  if (a == null || b == null) return false
  if ((isNumber(a) || isBigInt(a)) && (isNumber(b) || isBigInt(b))) return a == b
  const diff = minus(a, b)
  const ab = toNumberishAtom(diff).numerator
  return ab === ZeroBigint
}
export const eq = equal

export function getMax<A extends Numberish, B extends Numberish>(a: A, b: B): A | B {
  return gt(b, a) ? b : a
}

export function getMin<A extends Numberish, B extends Numberish>(a: A, b: B): A | B {
  return lt(b, a) ? b : a
}
