import { Numberish } from './types'
import { eq, gt } from './compare'
import { toStringNumber } from './numberishAtom'
import { mul } from './operations'
import { toFixedDecimal } from './utils'

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

    // TODO: imply it!!
    /** by default, 9999.99999 */
    max?: number
    // TODO: imply it!!
    /** by default, 0.00001 */
    min?: number
  }
): string {
  const nPart = (() => {
    try {
      const stringPart = toFixedDecimal(mul(n ?? 0, options?.alreadyPercented ? 1 : 100), options?.fixed ?? 2)
      if (eq(n, 0)) return '0'
      if (!options?.exact && stringPart === '0.00') return options?.alwaysSigned ? '<+0.01' : '<0.01'
      return options?.alwaysSigned ? getSign(stringPart) + toStringNumber(getUnsignNumber(stringPart)) : stringPart
    } catch (err) {
      return '0'
    }
  })()
  return options?.noUnit ? nPart : `${nPart}%`
}

/**
 *
 * @example
 * parsePercentString('58%') //=> '0.58'
 * @param s toPercentString returned value
 * @returns js:number
 */
export function parsePercentString(s: `${string}%` | number): number {
  const isPercentString = typeof s === 'string' && s.endsWith('%')
  return isPercentString ? Number(s.replace('%', '')) / 100 : (s as number)
}

function getSign(s: Numberish) {
  return gt(s, 0) ? '+' : '-'
}
function getUnsignNumber(s: Numberish) {
  return gt(s, 0) ? s : mul(s, -1)
}
