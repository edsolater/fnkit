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
   * toFormattedNumber(7000000.2) // result: '7,000,000.200'
   * toFormattedNumber(7000000.2, { separator: '_' }) // result: '7_000_000.200'
   */
  groupSeparator?: string
  /**
   * @default 3
   * @example
   * toFormattedNumber(10000.2) // result: '10,000.200'
   * toFormattedNumber(10000.1234, { seperatorEach: 4 }) // result: '1,0000.123400'
   */
  groupSize?: number
  /**
   * how many fraction number. (if there is noting, 0 will be added )
   * @default 2
   * @example
   * toFormattedNumber(100.2, { decimals: 3 }) // result: '100.200'
   * toFormattedNumber(100.2, { decimals: auto }) // result: '100.2'
   * toFormattedNumber(100.1234, { decimals: 6 }) // result: '100.123400'
   */
  decimals?: number | 'auto'
  
  // https://github.com/raydium-io/raydium-ui-v3-inner/blob/22383d458a59e05d77d29e318a25c200005edc85/src/utils/numberish/formatNumber.ts
  // /**
  //  * how many fraction number. (if there is noting, 0 will be added )
  //  * @default 'fixed'
  //  * @example
  //  * formatNumber(100.2, { fractionLength: 3, decimalMode: 'trim' }) // result: '100.2'
  //  * formatNumber(100.2, { fractionLength: 'auto', decimalMode: 'trim' }) // result: '100.2'
  //  * formatNumber(100.1234, { fractionLength: 6, decimalMode: 'trim' }) // result: '100.1234'
  //  */
  // decimalMode?: 'fixed' | 'trim'

  // /**
  //  * if true, always use shorter expression
  //  * if set this, only max 1 digit
  //  * @default false
  //  * @example
  //  * formatNumber(1000000000, { useShorterExpression: false }) // result: '1,000,000,000'
  //  * formatNumber(1100000000, { useShorterExpression: true }) // result: '1.1B'
  //  * formatNumber(1000300, { useShorterExpression: true }) // result: '1M'
  //  * formatNumber(1020, { useShorterExpression: true }) // result: '1K'
  //  * formatNumber(102000, { useShorterExpression: true }) // result: '102K'
  //  * formatNumber(102.2344, { useShorterExpression: true }) // result: '102.2'
  //  */
  // useShorterExpression?: boolean
}

/**
 * to formated number string
 * @example
 * toFormattedNumber(undefined) // '0'
 * toFormattedNumber(7000000.2) // result: '7,000,000.20'
 * toFormattedNumber(8800.1234, { seperator: '', decimals: 6 }) // result: '8,800.123400'
 * toFormattedNumber(100.1234, { decimals: 3 }) // result: '100.123'
 */
export function toFormattedNumber(
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
 * it a function that reverse the result of {@link toFormattedNumber}
 * @param numberString a string represent a number. e.g. -70,000.050
 * @example
 * parsePrettierNumberString('-70,000.050') // result: -70000.05
 */
export function parseFormattedNumberString(numberString: string): number {
  const pureNumberString = [...numberString].reduce((acc, char) => acc + (/\d|\.|-/.test(char) ? char : ''), '')
  return Number(pureNumberString)
}
