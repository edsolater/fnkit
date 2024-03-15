import { isNumber } from "../dataType"
import { toFraction, toStringNumber } from "./numberishAtom"
import { Fraction, Numberish } from "./types"
import { padZeroR } from "./padZero"

export type NumberishOption = {
  /**
   * if too much, turncate not care decimals
   * @example
   * toString('3.14897987', 2) => '3.14'
   * toString('3.14897987', 0) => '3'
   * toString('3.14897987') => '3.148979'
   * @default 6
   */ decimals?: number
}

/**
 * CAUTION : if original number have decimal part, it will lost
 */
export function toBigint(from: Numberish | Fraction): bigint {
  const atom = toFraction(from)
  const { decimal = 0, numerator, denominator = 1n } = atom
  if (decimal === 0) return numerator / denominator
  if (decimal < 0) return BigInt(padZeroR(String(numerator), -decimal)) / denominator
  return BigInt(String(numerator / denominator).slice(0, -decimal) || "0")
}

/**
 * CAUTION 1: if original number have very long decimal part, it will lost
 * CAUTION 2: result MUST between MAX_SAFE_INTEGER and MIN_SAFE_INTEGER
 *
 */
export function toNumber(from: Numberish | Fraction): number {
  const n = isNumber(from) ? from : Number(toStringNumber(from))
  if (n > Number.MAX_SAFE_INTEGER) {
    console.error("toNumber error, bigger than MAX_SAFE_INTEGER")
    return Number.MAX_SAFE_INTEGER
  }
  if (n < Number.MIN_SAFE_INTEGER) {
    console.error("toNumber error, smaller than MIN_SAFE_INTEGER")
    return Number.MIN_SAFE_INTEGER
  }
  return n
  // if (decimal === 0) {
  //   if (numerator > Number.MAX_SAFE_INTEGER) {
  //     console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
  //     return Number.MAX_SAFE_INTEGER
  //   }
  //   if (numerator < Number.MIN_SAFE_INTEGER) {
  //     console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
  //     return Number.MIN_SAFE_INTEGER
  //   }
  //   return Number(numerator)
  // }

  // if (decimal < 0) {
  //   const n = Number(padZeroR(String(numerator), -decimal))
  //   if (n > Number.MAX_SAFE_INTEGER) {
  //     console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
  //     return Number.MAX_SAFE_INTEGER
  //   }
  //   if (n < Number.MIN_SAFE_INTEGER) {
  //     console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
  //     return Number.MIN_SAFE_INTEGER
  //   }
  //   return n
  // }

  // const n = Number(String(numerator).slice(0, -decimal) || '0')
  // if (n > Number.MAX_SAFE_INTEGER) {
  //   console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
  //   return Number.MAX_SAFE_INTEGER
  // }
  // if (n < Number.MIN_SAFE_INTEGER) {
  //   console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
  //   return Number.MIN_SAFE_INTEGER
  // }
  // return n
}
