/**
 * it's format content, not face like
 */

import { fall } from '../fall'
import { Numberish } from '../typings'
import { toString } from './changeFormats'
import { toFixedDecimal } from './utils'

export type FormatOptions = {
  /**
   * separator symbol
   * @default ','
   * @example
   * formatNumber(7000000.2) // result: '7,000,000.200'
   * formatNumber(7000000.2, { separator: '_' }) // result: '7_000_000.200'
   */
  groupSeparator?: string
  /**
   * @default 3
   * @example
   * formatNumber(10000.2) // result: '10,000.200'
   * formatNumber(10000.1234, { seperatorEach: 4 }) // result: '1,0000.123400'
   */
  groupSize?: number
  /**
   * how many fraction number. (if there is noting, 0 will be added )
   * @default 2
   * @example
   * formatNumber(100.2, { decimals: 3 }) // result: '100.200'
   * formatNumber(100.2, { decimals: auto }) // result: '100.2'
   * formatNumber(100.1234, { decimals: 6 }) // result: '100.123400'
   */
  decimals?: number | 'auto'
}

/**
 * to formated number string
 * @example
 * toPrettierNumberString(undefined) // '0'
 * toPrettierNumberString(7000000.2) // result: '7,000,000.20'
 * toPrettierNumberString(8800.1234, { seperator: '', decimals: 6 }) // result: '8,800.123400'
 * toPrettierNumberString(100.1234, { decimals: 3 }) // result: '100.123'
 */
export function toPrettierNumberString(
  n: Numberish | undefined,
  { groupSeparator = ',', decimals = 2, groupSize = 3 }: FormatOptions = {}
): string {
  if (n === undefined) return '0'
  return fall(n, [
    (n) => (decimals === 'auto' ? toString(n) : toFixedDecimal(toString(n), decimals)),
    (str) => {
      const [, sign = '', int = '', dec = ''] = str.match(/(-?)(\d*)\.?(\d*)/) ?? []
      const newIntegerPart = [...int].reduceRight((acc, cur, idx, strN) => {
        const indexFromRight = strN.length - 1 - idx
        const shouldAddSeparator = indexFromRight !== 0 && indexFromRight % groupSize! === 0
        return cur + (shouldAddSeparator ? groupSeparator : '') + acc
      }, '') as string
      return dec ? `${sign}${newIntegerPart}.${dec}` : `${sign}${newIntegerPart}`
    }
  ])
}
/**
 * parse a string
 *
 * it a function that reverse the result of {@link toPrettierNumberString}
 * @param numberString a string represent a number. e.g. -70,000.050
 * @example
 * parsePrettierNumberString('-70,000.050') // result: -70000.05
 */
export function parsePrettierNumberString(numberString: string): number {
  const pureNumberString = [...numberString].reduce((acc, char) => acc + (/\d|\.|-/.test(char) ? char : ''), '')
  return Number(pureNumberString)
}



