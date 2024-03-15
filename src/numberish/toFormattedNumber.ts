/**
 * it's format content, not face like
 */
import { fall } from "../fall"
import { Numberish } from "./types"
import { toStringNumber } from "./numberishAtom"
import { toFixedDecimal } from "./utils"
import { isNumber } from "../dataType"

export type NumberishFormatOptions = {
  /**
   * separator  symbol between 3 number
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
  decimals?: number | "auto"

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

  /**
   * if true, always use shorter expression
   * if set this, only max 1 digit
   * @default false
   * @todo imply it!
   * @example
   * formatNumber(1000000000, { shortExpression: false }) // result: '1,000,000,000'
   * formatNumber(1100000000, { shortExpression: true }) // result: '1.1B'
   * formatNumber(1000300, { shortExpression: true }) // result: '1M'
   * formatNumber(1020, { shortExpression: true }) // result: '1K'
   * formatNumber(102000, { shortExpression: true }) // result: '102K'
   * formatNumber(102.2344, { shortExpression: true }) // result: '102.2'
   */
  shortExpression?: boolean

  /**
   * @default 2
   */
  shortExpressionDecimal?: number
}

/**
 * to formatted number string
 * @example
 * toFormattedNumber(undefined) // '0'
 * toFormattedNumber(7000000.2) // result: '7,000,000.20'
 * toFormattedNumber(8800.1234, { seperator: '', decimals: 6 }) // result: '8,800.123400'
 * toFormattedNumber(100.1234, { decimals: 3 }) // result: '100.123'
 */
export function toFormattedNumber(n: Numberish | undefined, options?: NumberishFormatOptions): string {
  if (n === undefined) {
    if (options?.decimals === "auto") return "0"
    if (!options || (options.decimals && options.decimals > 0)) return "0" + "." + "0".repeat(options?.decimals ?? 2)
  }
  return options?.shortExpression
    ? fall(n, [
        (s) => toStringNumber(s, { decimals: ((options?.decimals === "auto" ? 2 : options?.decimals) ?? 2) + 1 }),
        (s) => fixDecimal(s, options),
        (s) => handleShortExpression(s, options),
      ])
    : fall(n, [
        (s) => toStringNumber(s, { decimals: ((options?.decimals === "auto" ? 2 : options?.decimals) ?? 2) + 1 }),
        (s) => fixDecimal(s, options),
        (s) => groupSeparater(s, options),
      ])
}

function groupSeparater(str: string, options?: Pick<NumberishFormatOptions, "groupSeparator" | "groupSize">) {
  const [, sign = "", int = "", dec = ""] = str.match(/(-?)(\d*)\.?(\d*)/) ?? []
  const newIntegerPart = [...int].reduceRight((acc, cur, idx, strN) => {
    const indexFromRight = strN.length - 1 - idx
    const shouldAddSeparator = indexFromRight !== 0 && indexFromRight % (options?.groupSize ?? 3) === 0
    return shouldAddSeparator ? cur + (options?.groupSeparator ?? ",") + acc : cur + acc
  }, "") as string
  return dec ? `${sign}${newIntegerPart}.${dec}` : `${sign}${newIntegerPart}`
}

function fixDecimal(n: string, options?: Pick<NumberishFormatOptions, "decimals">): string {
  return options?.decimals === "auto" ? n : toFixedDecimal(n, options?.decimals ?? 2)
}

function handleShortExpression(str: string, options?: Pick<NumberishFormatOptions, "shortExpressionDecimal">) {
  const [, sign = "", int = "", dec = ""] = str.match(/(-?)(\d*)\.?(\d*)/) ?? []
  const decimals = options?.shortExpressionDecimal ?? 2
  if (int.length > 3 * 4) {
    return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 4 + 2)) / 100).toFixed(decimals))}T`
  } else if (int.length > 3 * 3) {
    return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 3 + 2)) / 100).toFixed(decimals))}B`
  } else if (int.length > 3 * 2) {
    return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 2 + 2)) / 100).toFixed(decimals))}M`
  } else if (int.length > 3 * 1) {
    return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 1 + 2)) / 100).toFixed(decimals))}K`
  } else {
    return dec ? `${sign}${int}.${dec}` : `${sign}${int}`
  }
}

/**
 *
 * @example
 * trimTailingZero('-33.33000000') //=> '-33.33'
 * trimTailingZero('-33.000000') //=> '-33'
 * trimTailingZero('.000000') //=> '0'
 */
export function trimTailingZero(s: string) {
  // no decimal part
  if (!s.includes(".")) return s
  const [, sign, int, dec] = s.match(/(-?)([\d,_]*)\.?(\d*)/) ?? []
  let cleanedDecimalPart = dec
  while (cleanedDecimalPart.endsWith("0")) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, cleanedDecimalPart.length - 1)
  }
  return cleanedDecimalPart ? `${sign}${int}.${cleanedDecimalPart}` : `${sign}${int}` || "0"
}
