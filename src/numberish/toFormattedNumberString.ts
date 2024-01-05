/**
 * it's format content, not face like
 */

import { fall } from '../fall'
import { Numberish } from '../typings'
import { toString } from './numberishAtom'
import { toFixedDecimal } from './utils'

export type FormatOptions = {
  /**
   * separator symbol
   * @default ','
   * @example
   * toFormattedNumberString(7000000.2) // result: '7,000,000.200'
   * toFormattedNumberString(7000000.2, { separator: '_' }) // result: '7_000_000.200'
   */
  groupSeparator?: string
  /**
   * @default 3
   * @example
   * toFormattedNumberString(10000.2) // result: '10,000.200'
   * toFormattedNumberString(10000.1234, { seperatorEach: 4 }) // result: '1,0000.123400'
   */
  groupSize?: number
  /**
   * how many fraction number. (if there is noting, 0 will be added )
   * @default 2
   * @example
   * toFormattedNumberString(100.2, { decimals: 3 }) // result: '100.200'
   * toFormattedNumberString(100.2, { decimals: auto }) // result: '100.2'
   * toFormattedNumberString(100.1234, { decimals: 6 }) // result: '100.123400'
   */
  decimals?: number | 'auto'
}

/**
 * to formated number string
 * @example
 * toFormattedNumberString(undefined) // '0'
 * toFormattedNumberString(7000000.2) // result: '7,000,000.20'
 * toFormattedNumberString(8800.1234, { seperator: '', decimals: 6 }) // result: '8,800.123400'
 * toFormattedNumberString(100.1234, { decimals: 3 }) // result: '100.123'
 */
export function toFormattedNumberString(
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
 * it a function that reverse the result of {@link toFormattedNumberString}
 * @param numberString a string represent a number. e.g. -70,000.050
 * @example
 * parsePrettierNumberString('-70,000.050') // result: -70000.05
 */
export function parseFormattedNumberString(numberString: string): number {
  const pureNumberString = [...numberString].reduce((acc, char) => acc + (/\d|\.|-/.test(char) ? char : ''), '')
  return Number(pureNumberString)
}
