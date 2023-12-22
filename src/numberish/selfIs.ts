import { Numberish } from '../typings'
import { ZeroBigint } from './constant'
import { toNumberishAtom } from './numberishAtom'
import { mod } from './operations'

export function isMeaningfulNumber<T extends Numberish | undefined>(n: T): n is NonNullable<T> {
  if (n == null) return false
  return !isZero(n)
}

export function isMeaninglessNumber<T extends Numberish | undefined>(n: T): boolean {
  if (n == null) return true
  return isZero(n)
}

export function hasDecimal<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  return a == null ? false : !isInt(a)
}

export function isInt<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { decimal, denominator, numerator } = toNumberishAtom(a)
  if (!decimal && !denominator) return true
  const modResult = mod(numerator, denominator * 10n ** BigInt(decimal))
  return isZero(modResult)
}

export function isZero<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { numerator, denominator } = toNumberishAtom(a)
  return numerator === ZeroBigint && denominator !== ZeroBigint
}

export function notZero<T extends Numberish | undefined>(a: T): boolean {
  return a && !isZero(a)
}

export function isNegative<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { numerator, denominator } = toNumberishAtom(a)
  return (numerator > 0n && denominator < 0n) || (numerator < 0n && denominator > 0n)
}

export function isPositive<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { numerator, denominator } = toNumberishAtom(a)
  return (numerator > 0n && denominator > 0n) || (numerator < 0n && denominator < 0n)
}

