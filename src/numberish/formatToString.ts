/**
 * it's format content, not face like
 */

import { equal } from 'assert'
import { fall } from '../fall'
import { Numberish } from '../typings'
import { eq, gt } from './compare'
import { mul } from './operations'
import { toString } from './changeFormat'
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
   * formatNumber(100.2, { fractionLength: 3 }) // result: '100.200'
   * formatNumber(100.2, { fractionLength: auto }) // result: '100.2'
   * formatNumber(100.1234, { fractionLength: 6 }) // result: '100.123400'
   */
  fractionLength?: number | 'auto'
}

/**
 * to formated number string
 * @example
 * formatNumber(undefined) // '0'
 * formatNumber(7000000.2) // result: '7,000,000.20'
 * formatNumber(8800.1234, { seperator: '', fractionLength: 6 }) // result: '8,800.123400'
 * formatNumber(100.1234, { fractionLength: 3 }) // result: '100.123'
 */
export function toFormatedNumber(
  n: Numberish | undefined,
  { groupSeparator = ',', fractionLength = 2, groupSize = 3 }: FormatOptions = {}
): string {
  if (n === undefined) return '0'
  return fall(n, [
    (n) => (fractionLength === 'auto' ? toString(n) : toFixedDecimal(toString(n), fractionLength)),
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
 * it a function that reverse the result of {@link toFormatedNumber}
 * @param numberString a string represent a number. e.g. -70,000.050
 * @example
 * parseFormatedNumberString('-70,000.050') // result: -70000.05
 */
export function parseFormatedNumberString(numberString: string): number {
  const pureNumberString = [...numberString].reduce(
    (acc, char) => acc + (/\d|\.|-/.test(char) ? char : ''),
    ''
  )
  return Number(pureNumberString)
}

/**
 * @example
 * toPercentString(0.58) //=> '58%'
 * toPercentString('0.58', { fixed: 2 }) //=> '58.00%'
 * toPercentString(new Fraction(58, 100)) //=> '58.00%'
 * toPercentString(58, {}) //=> '58.00%'
 */
export function toPercentString(
  n: Numberish | undefined,
  options?: {
    /** by default, it will output <0.01% if it is too small   */
    exact?: boolean
    /** @default 2  */
    fixed?: number
    /** maybe backend will, but it's freak */
    alreadyPercented?: boolean
    /** usually used in price */
    alwaysSigned?: boolean

    /** no % */
    noUnit?: boolean
  }
): string {
  try {
    const stringPart = toFixedDecimal(
      mul(n ?? 0, options?.alreadyPercented ? 1 : 100),
      options?.fixed ?? 2
    )
    if (eq(n, 0)) return `0${options?.noUnit ? '' : '%'}`
    if (!options?.exact && stringPart === '0.00')
      return options?.alwaysSigned
        ? `<+0.01${options?.noUnit ? '' : '%'}`
        : `<0.01${options?.noUnit ? '' : '%'}`
    return options?.alwaysSigned
      ? `${getSign(stringPart)}${toString(getUnsignNumber(stringPart))}${
          options?.noUnit ? '' : '%'
        }`
      : `${stringPart}${options?.noUnit ? '' : '%'}`
  } catch (err) {
    return `0${options?.noUnit ? '' : '%'}`
  }
}

function getSign(s: Numberish) {
  return gt(s, 0) ? '+' : '-'
}
function getUnsignNumber(s: Numberish) {
  return gt(s, 0) ? s : mul(s, -1)
}
