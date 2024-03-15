import { isBigInt, isNaN, isNumber, isString } from "../dataType"
import { ZeroBigint } from "./constant"
import { toFraction } from "./numberishAtom"
import { mod } from "./operations"
import { impureNumberish } from "./parseNumberish"
import { Numberish, type StringNumber } from "./types"

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

export function isNumberSafeInteger(v: any): v is number {
  return isNumber(v) && v < Number.MAX_SAFE_INTEGER && v > Number.MIN_SAFE_INTEGER && Number.isSafeInteger(v)
}
export function isNumberSafe(v: any): v is number {
  return isNumber(v) && v < Number.MAX_SAFE_INTEGER && v > Number.MIN_SAFE_INTEGER
}

export function isBigIntable(v: any): v is bigint | string | number {
  return isBigInt(v) || isStringInteger(v) || isNumberSafeInteger(v)
}

export function isInt<T extends Numberish | undefined>(v: T): v is NonNullable<T> {
  if (v == null) return false
  const pure = impureNumberish(v)
  if (isBigInt(pure)) return true
  if (isNumber(pure)) return Number.isInteger(pure)
  if (isStringNumber(pure)) return Number.isInteger(Number(pure))
  const atom = toFraction(pure)
  const { decimal, denominator = 1n, numerator } = atom

  const modResult = decimal ? mod(numerator, denominator * 10n ** BigInt(decimal)) : mod(numerator, denominator)
  return isZero(modResult)
}

export function isZero<T extends Numberish | undefined>(v: T): v is NonNullable<T> {
  if (v == null) return false
  const pure = impureNumberish(v)
  if (pure === 0) return true
  if (pure === 0n) return true
  if (pure === "0") return true
  if (isString(pure) && /^0(?:\.0*)?$/.test(pure)) return true
  const { numerator, denominator } = toFraction(pure)
  return numerator === ZeroBigint && denominator !== ZeroBigint
}

export function notZero<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  return a && !isZero(a)
}

export function isNegative<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const pure = impureNumberish(a)
  if (isNumber(pure)) return pure < 0
  if (isBigInt(pure)) return pure < 0n
  if (isString(pure) && isStringNumber(pure)) return pure.trim() != "" && pure.trim().startsWith("-")
  const { denominator = 1n, numerator } = toFraction(pure)
  return (numerator > 0n && denominator < 0n) || (numerator < 0n && denominator > 0n)
}

export function isPositive<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const pure = impureNumberish(a)
  if (isNumber(pure)) return pure > 0
  if (isBigInt(pure)) return pure > 0n
  if (isString(pure) && isStringNumber(pure)) return pure.trim() != "" && !pure.trim().startsWith("-")
  const { denominator = 1n, numerator } = toFraction(pure)
  return (numerator > 0n && denominator > 0n) || (numerator < 0n && denominator < 0n)
}

export function isGreaterThanOne<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const pure = impureNumberish(a)
  if (isNumber(pure)) return pure > 1
  if (isBigInt(pure)) return pure > 1n
  if (isString(pure) && isStringNumber(pure)) return pure.trim() != "" && pure.trim() !== "0" && pure.trim() !== "1"
  const { denominator = 1n, numerator } = toFraction(pure)
  return numerator > denominator
}

export function isLessThanOne<T extends Numberish | undefined>(a: T): a is NonNullable<T> {
  if (a == null) return false
  const pure = impureNumberish(a)
  if (isNumber(pure)) return pure < 1
  if (isBigInt(pure)) return pure < 1n
  if (isString(pure) && isStringNumber(pure)) return pure.trim() != "" && pure.trim() !== "0" && pure.trim() !== "1"
  const { denominator = 1n, numerator } = toFraction(pure)
  return numerator < denominator
}

export function isStringNumber(v: any): v is StringNumber {
  if (v === "") return false
  if (isNumber(v)) return true
  if (isBigInt(v)) return true
  const n = Number(v)
  return isNumber(n) && !isNaN(n)
}

const stringNumberIntegerRegexp = /^-?\d+$/

export function isStringInteger(v: any): v is string {
  return isString(v) && stringNumberIntegerRegexp.test(v)
}
