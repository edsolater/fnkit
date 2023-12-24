import { isBigInt, isNumber, isString, isStringNumber } from '../dataType'
import { Numberish } from '../typings'
import { ZeroBigint } from './constant'
import { fromNumberishAtomToFraction, toNumberishAtom } from './numberishAtom'
import { mod } from './operations'
import { impureNumberish } from './parseNumberish'

export function isMeaningfulNumber<T extends Numberish | undefined>(n: T): n is NonNullable<T> {
  if (n == null) return false
  return !isZero(n)
}

export function isMeaninglessNumber<T extends Numberish | undefined>(n: T): boolean {
  if (n == null) return true
  return isZero(n)
}

export function hasDecimal<T extends Numberish | undefined>(v: T): v is NonNullable<T> {
  return v == null ? false : !isInt(v)
}

export function isInt<T extends Numberish | undefined>(v: T): v is NonNullable<T> {
  if (v == null) return false
  const pure = impureNumberish(v)
  if (isBigInt(pure)) return true
  if (isNumber(pure)) return Number.isInteger(pure)
  if (isStringNumber(pure)) return Number.isInteger(Number(pure))
  const atom = toNumberishAtom(pure)
  const { decimal, denominator, numerator } = fromNumberishAtomToFraction(atom)

  const modResult = decimal ? mod(numerator, denominator * 10n ** BigInt(decimal)) : mod(numerator, denominator)
  return isZero(modResult)
}

export function isZero<T extends Numberish | undefined>(v: T): v is NonNullable<T> {
  if (v == null) return false
  const pure = impureNumberish(v)
  if (pure === 0) return true
  if (pure === 0n) return true
  if (pure === '0') return true
  if (isString(pure) && /^0(?:\.0*)?$/.test(pure)) return true
  const { numerator, denominator } = fromNumberishAtomToFraction(toNumberishAtom(pure))
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
