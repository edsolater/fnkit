/**
 * parse all kind of number
 * @module
 */

import { NumberishOption, assert, isArray, isBigInt, isNumber, isObject, isString } from ".."
import { OneBigint, TenBigint } from "./constant"
import { isMathematicalExpression, isRPNItem, parseRPNToFraction, toRPN } from "./numberExpression"
import { padZeroR } from "./padZero"
import { shakeTailingZero } from "./trimZero"
import { BasicNumberish, Fraction, Numberish, type StringNumber } from "./types"

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export function isFraction(value: any): value is Fraction {
  return isObject(value) && "numerator" in value
}
export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isFraction(v) || isFraction(v)
}
export function isBasicNumberish(v: unknown): v is BasicNumberish {
  return isNumber(v) || isFraction(v)
}

// 300 => { numerator: 3n, denominator: 1n, decimal: -2 }
// 320 => { numerator: 32n, denominator: 1n, decimal: -1 }
export function toFractionFromNumberString(str: string): Fraction {
  const [intPart = "", decimalPart = ""] = str.split(".")
  return { decimal: decimalPart.length, numerator: BigInt(`${intPart}${decimalPart}`), denominator: 1n }
}

function toFractionFromBigInt(n: bigint): Fraction {
  return { numerator: n, decimal: 0, denominator: 1n }
}

function toFractionFromNumber(n: number): Fraction {
  if (Number.isInteger(n)) return toFractionFromBigInt(BigInt(n))
  const str = String(n)
  return toFractionFromNumberString(str)
}
type ScientificNotionDetail = {
  sign: "-" | "+" | ""
  int: string
  dec: string
  exp: string
}
const scientificNotationRegex = /^(?<sign>[+-]?)(?<int>\d+)\.?(?<dec>\d*)[eE](?<exp>[+-]?\d+)$/
export function isScientificNotation(str: any): boolean {
  return (isString(str) || isNumber(str)) && scientificNotationRegex.test(String(str))
}

export function parseScientificNotionStr(str: string): ScientificNotionDetail {
  const regexInfo = str.match(scientificNotationRegex)?.groups
  // @ts-expect-error force to return
  return regexInfo
}

/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { numerator: 42312n, denominator: 1n, decimal: 2 }
 *  '12' => { numerator: 12n, denominator: 1n, decimal: 0 }
 */
//TODO: `toFaction` (which accept numberExpression) is higher than `toBasicFraction()`
export function toFraction(from: Numberish): Fraction {
  if (isFraction(from)) return from

  if (isObject(from) && "toNumberish" in from) return toFraction(from.toNumberish())

  if (isArray(from) && from.every(isRPNItem)) return parseRPNToFraction(from)

  if (isBigInt(from)) return toFractionFromBigInt(from)
    
  if (isNumber(from) && !isScientificNotation(from)) {
    return toFractionFromNumber(from)
  } else {
    // string or scientific notation number/string
    if (isScientificNotation(from)) {
      const [nPart = "", ePart = ""] = String(from).split(/[eE]/)
      const nPartNumberishAtom = toFractionFromNumberString(nPart)
      return { ...nPartNumberishAtom, decimal: (nPartNumberishAtom.decimal ?? 0) + -Number(ePart) }
    }
    if (isMathematicalExpression(from)) return parseRPNToFraction(toRPN(from))
    else return toFractionFromNumberString(String(from))
  }
}

/**
 * @example
 * toString(3) //=> '3'
 * toString(.3) //=> '0.3'
 * toString('8n') //=> '8'
 * toString({ decimal: 2, all: '42312' }) => '423.12'
 * toString({ decimal: 0, all: '12' }) //=> '12'
 * toString({ decimal: 7, all: '40000000' }) //=> '4'
 *
 */
export function toStringNumber(from: Numberish | undefined, options?: NumberishOption): StringNumber {
  if (from === undefined) return "0"
  const stringNumber = (() => {
    if (isNumber(from))
      return from > Number.MAX_SAFE_INTEGER ? String(BigInt(from)) : from.toFixed(options?.decimals ?? 6)

    if (isBigInt(from)) return String(from)

    if (isString(from) && !isMathematicalExpression(from)) return from

    // fraction
    const { decimal = 0, numerator, denominator = 1n } = toFraction(from)

    if (denominator === OneBigint) {
      if (decimal === 0) return String(numerator)
      if (decimal < 0) return padZeroR(String(numerator), -decimal)
      return [
        String(numerator).slice(0, -decimal) || "0",
        ".",
        String(numerator).padStart(decimal, "0").slice(-decimal),
      ].join("")
    }

    const decimalPlace = options?.decimals ?? 6
    assert(decimalPlace >= 0, "to strinify, deciamlPlace(options.decimal) must be positive")

    let finalRawNumerator: bigint
    let finalRawDenominator: bigint
    if (decimal >= 0) {
      finalRawNumerator = numerator * TenBigint ** BigInt(decimalPlace)
      finalRawDenominator = denominator * TenBigint ** BigInt(decimal)
    } else {
      finalRawNumerator = numerator * TenBigint ** (BigInt(decimalPlace) + BigInt(-decimal))
      finalRawDenominator = denominator
    }

    let finalRawN = String(finalRawNumerator / finalRawDenominator)
    const sign = finalRawN.startsWith("-") || finalRawN.startsWith("+") ? finalRawN[0] : ""
    if (sign) {
      finalRawN = finalRawN.slice(1)
    }

    const finalN =
      decimalPlace === 0
        ? finalRawN
        : `${finalRawN.slice(0, -decimalPlace) || "0"}.${(finalRawN.length >= decimalPlace
            ? finalRawN
            : finalRawN.padStart(decimalPlace, "0")
          ).slice(-decimalPlace)}`
    return sign + finalN
  })()
  return shakeTailingZero(stringNumber)
}
