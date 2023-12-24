import { Numberish } from '../typings'
import { ZeroBigint } from './constant'
import { fromNumberishAtomToFraction, toBasicFraction, toNumberishAtom } from './numberishAtom'
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
  // should judger number | stringNumber as faster as it can
  const { decimal, denominator, numerator } = fromNumberishAtomToFraction(toNumberishAtom(a))
  // if (decimal === 0 && denominator === 1n) return true
  const modResult = decimal ? mod(numerator, denominator * 10n ** BigInt(decimal)) : mod(numerator, denominator)
  return isZero(modResult)
}

export function isZero<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { numerator, denominator } = fromNumberishAtomToFraction(toNumberishAtom(a))
  return numerator === ZeroBigint && denominator !== ZeroBigint
}

export function notZero<T extends Numberish | undefined>(a: T): boolean {
  return a && !isZero(a)
}

export function isNegative<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { denominator = 1n, numerator } = fromNumberishAtomToFraction(toNumberishAtom(a))
  return (numerator > 0n && denominator < 0n) || (numerator < 0n && denominator > 0n)
}

export function isPositive<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const { denominator = 1n, numerator } = fromNumberishAtomToFraction(toNumberishAtom(a))
  return (numerator > 0n && denominator > 0n) || (numerator < 0n && denominator < 0n)
}
