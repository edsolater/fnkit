import { isNumber } from '../dataType'
import { Numberish, NumberishAtom } from '../typings'
import { OneBigint, TenBigint } from './constant'
import { toNumberishAtom } from './numberishAtom'
import { padZeroR, shakeTailingZero } from './utils'

export type NumberishOption = {
  /**
   * if too much, turncate not care decimals
   * @example
   * toString('3.14897987', 2) => '3.14'
   * toString('3.14897987', 0) => '3'
   * toString('3.14897987') => '3.148979'
   * @default 6
   */ maxDecimalPlace?: number
}
/**
 * @example
 * toString(3) //=> '3'
 * toString('.3') //=> '0.3'
 * toString('8n') //=> '8'
 * toString({ decimal: 2, all: '42312' }) => '423.12'
 * toString({ decimal: 0, all: '12' }) //=> '12'
 * toString({ decimal: 7, all: '40000000' }) //=> '4'
 */
export function toString(from: Numberish, options?: NumberishOption): string {
  const { decimal, numerator, denominator } = toNumberishAtom(from)
  if (denominator === OneBigint) {
    if (decimal === 0) return String(numerator)
    if (decimal < 0) return padZeroR(String(numerator), -decimal)
    return shakeTailingZero(
      [String(numerator).slice(0, -decimal) || '0', '.', String(numerator).padStart(decimal, '0').slice(-decimal)].join(
        ''
      )
    )
  } else {
    const decimalPlace = options?.maxDecimalPlace ?? 6
    const finalNumerator = numerator * TenBigint ** BigInt(decimalPlace)
    const finalDenominator = TenBigint ** BigInt(decimal) * denominator
    const finalN = String(finalNumerator / finalDenominator)
    return shakeTailingZero(`${finalN.slice(0, -decimalPlace)}.${finalN.slice(-decimalPlace)}`)
  }
}
/**
 * CAUTION : if original number have decimal part, it will lost
 */
export function toBigint(from: Numberish | NumberishAtom): bigint {
  const { decimal, numerator, denominator } = toNumberishAtom(from)
  if (decimal === 0) return numerator / denominator
  if (decimal < 0) return BigInt(padZeroR(String(numerator), -decimal)) / denominator
  return BigInt(String(numerator / denominator).slice(0, -decimal) || '0')
}

/**
 * CAUTION 1: if original number have very long decimal part, it will lost
 * CAUTION 2: result MUST between MAX_SAFE_INTEGER and MIN_SAFE_INTEGER
 *
 */
export function toNumber(from: Numberish | NumberishAtom): number {
  const n = isNumber(from) ? from : Number(toString(from))
  if (n > Number.MAX_SAFE_INTEGER) {
    console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
    return Number.MAX_SAFE_INTEGER
  }
  if (n < Number.MIN_SAFE_INTEGER) {
    console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
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
