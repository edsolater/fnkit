import { Numberish } from './types'
import { stringNumberRegex } from './numberishAtom'
import { toString } from './numberishAtom'

/**
 *
 * @example
 * trimZero('-33.33000000') //=> '-33.33'
 * trimZero('-33.000000') //=> '-33'
 * trimZero('.000000') //=> '0'
 */
export function shakeTailingZero(s: string): string {
  // no decimal part
  if (!s.includes('.')) return s
  const { sign, int, dec } = s.match(stringNumberRegex)?.groups ?? {}
  let cleanedDecimalPart = dec
  while (cleanedDecimalPart.endsWith('0')) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, cleanedDecimalPart.length - 1)
  }
  return cleanedDecimalPart ? `${sign}${int}.${cleanedDecimalPart}` : `${sign}${int}` || '0'
}

/**
 * @example
 * padZeroR('30', 3) //=> '30000'
 */
export function padZeroR(str: string, count: number): string {
  return str + Array(count).fill('0').join('')
}
/**
 * @example
 * padZeroL('30', 3) //=> '00030'
 */
export function padZeroL(str: string, count: number): string {
  return Array(count).fill('0').join('') + str
}

export function toFixedDecimal(n: Numberish, decimals: number): string {
  const sn = toString(n)
  const [, sign = '', int = '', dec = ''] = sn.match(/(-?)(\d*)\.?(\d*)/) ?? []
  if (!dec) return `${sign}${int}`
  if (dec.length <= decimals) return `${sign}${int}.${dec.padEnd(decimals, '0')}`
  return decimals > 0 ? `${sign}${int}.${dec.slice(0, decimals)}` : `${sign}${int}`
}
