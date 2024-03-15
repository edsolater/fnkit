/**
 * parse all kind of number
 * @module
 */

import { NumberishOption, isArray, isBigInt, isNumber, isObject, isString } from '..'
import { OneBigint, TenBigint } from './constant'
import { isMathematicalExpression, isRPNItem, parseRPNToFraction, toRPN } from './numberExpression'
import { BasicNumberish, Fraction, Numberish } from './types'
import { shakeTailingZero } from './trimZero'
import { padZeroR } from './padZero'

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export function isFraction(value: any): value is Fraction {
  return isObject(value) && 'numerator' in value
}
export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isFraction(v) || isFraction(v)
}
export function isBasicNumberish(v: unknown): v is BasicNumberish {
  return isNumber(v) || isFraction(v)
}

function fromStringToFraction(str: string): Fraction {
  const [intPart = '', decimalPart = ''] = str.split('.')
  return { decimal: decimalPart.length, numerator: BigInt(String(intPart) + String(decimalPart)), denominator: 1n }
}

function fromBigIntToFraction(n: bigint): Fraction {
  return { numerator: n, decimal: 0, denominator: 1n }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*[eE][+-]?\d+$/
export function isScientificNotation(str: any): boolean {
  return (isString(str) || isNumber(str)) && scientificNotationRegex.test(String(str))
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
  if (isNumber(from)) {
    try {
      // for scientific notation number can be format like 1.34e+24
      return fromBigIntToFraction(BigInt(from))
    } catch {
      return fromStringToFraction(String(from))
    }
  }
  if (isBigInt(from)) return fromBigIntToFraction(from)
  if (isObject(from) && 'toNumberish' in from) return toFraction(from.toNumberish())
  if (isString(from)) {
    if (isScientificNotation(from)) {
      const [nPart = '', ePart = ''] = String(from).split(/[eE]/)
      const nPartNumberishAtom = fromStringToFraction(nPart)
      return { ...nPartNumberishAtom, decimal: (nPartNumberishAtom.decimal ?? 0) + -Number(ePart) }
    }
    if (isMathematicalExpression(from)) return parseRPNToFraction(toRPN(from))
    else return fromStringToFraction(from)
  }
  if (isArray(from) && from.every(isRPNItem)) return parseRPNToFraction(from)
  return fromStringToFraction(String(from))
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
export function toStringNumber(from: Numberish | undefined, options?: NumberishOption): string {
  if (from === undefined) return '0'
  const stringNumber = (() => {
    if (isNumber(from)) return from > Number.MAX_SAFE_INTEGER ? String(BigInt(from)) : String(from)
    if (isBigInt(from)) return String(from)
    if (isString(from) && !isMathematicalExpression(from)) return from
    const { decimal = 0, numerator, denominator = 1n } = toFraction(from)
    if (denominator === OneBigint) {
      if (decimal === 0) return String(numerator)
      if (decimal < 0) return padZeroR(String(numerator), -decimal)
      return [
        String(numerator).slice(0, -decimal) || '0',
        '.',
        String(numerator).padStart(decimal, '0').slice(-decimal)
      ].join('')
    } else {
      const decimalPlace = options?.decimals ?? 6
      const finalNumerator = numerator * TenBigint ** BigInt(decimalPlace)
      const finalDenominator = TenBigint ** BigInt(decimal) * denominator
      const finalN = String(finalNumerator / finalDenominator)
      return `${finalN.slice(0, -decimalPlace) || '0'}.${finalN.slice(-decimalPlace)}`
    }
  })()
  return shakeTailingZero(stringNumber)
}

