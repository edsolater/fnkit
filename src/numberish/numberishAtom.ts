/**
 * parse all kind of number
 * @module
 */

import {
  BasicNumberish,
  Fraction,
  Numberish,
  NumberishAction,
  NumberishAtom,
  NumberishOption,
  concat,
  excutiveAdd,
  excutiveDivide,
  excutiveMinus,
  excutiveMultiply,
  excutivePow,
  excutiveReciprocal,
  isArray,
  isBigInt,
  isNumber,
  isObject,
  isString,
  mergeObjects,
  omit
} from '..'
import { OneBigint, TenBigint, fractionZero } from './constant'
import { isNumberishExpression, parseRPNToNumberishAtom, toRPN } from './numberExpression'
import { padZeroR, shakeTailingZero } from './utils'

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export function isBasicFraction(value: any): value is Fraction {
  return isObject(value) && 'numerator' in value && 'denominator' in value
}

export function isNumberishAtom(value: any): value is NumberishAtom {
  return isObject(value) && 'numerator' in value
}

export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isNumberishAtom(v) || isBasicFraction(v)
}
export function isBasicNumberish(v: unknown): v is BasicNumberish {
  return isNumber(v) || isBasicFraction(v)
}

function toNumberishAtomRawFromString(str: string): Fraction {
  const [intPart = '', decimalPart = ''] = str.split('.')
  return { decimal: decimalPart.length, numerator: BigInt(String(intPart) + String(decimalPart)), denominator: 1n }
}

function toNumberishAtomRawFromBigInt(n: bigint): Fraction {
  return { numerator: n, decimal: 0, denominator: 1n }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*e[+-]?\d+$/
function isScientificNotation(str: any): boolean {
  return (isString(str) || isNumber(str)) && scientificNotationRegex.test(String(str))
}

export const fromNumberishAtomToFraction = parseCarriedActions
/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { numerator: 42312n, denominator: 1n, decimal: 2 }
 *  '12' => { numerator: 12n, denominator: 1n, decimal: 0 }
 */
//TODO: `toFaction` (which accept numberExpression) is higher than `toBasicFraction()`
export function toBasicFraction(from: BasicNumberish): Fraction {
  if (isBasicFraction(from)) return from
  if (isNumber(from)) {
    try {
      // for scientific notation number can be format like 1.34e+24
      return toNumberishAtomRawFromBigInt(BigInt(from))
    } catch {
      return toNumberishAtomRawFromString(String(from))
    }
  }
  if (isBigInt(from)) return toNumberishAtomRawFromBigInt(from)
  if (isScientificNotation(from)) {
    const [nPart = '', ePart = ''] = String(from).split(/e|E/)
    const nPartNumberishAtom = toNumberishAtomRawFromString(nPart)
    return { ...nPartNumberishAtom, decimal: (nPartNumberishAtom.decimal ?? 0) + -Number(ePart) }
  }
  return toNumberishAtomRawFromString(String(from))
}

type CreateNumberishAtomOptions = {
  operations?: NumberishAction[]
}

/**
 * toNumberishAtom(1e13) //=> { numerator: 10000000000000n, decimal: 0, denominator: 1n , toString: () => '10000000000000' }
 * @todo numberish Atom is higher than add/minus/multiply/divide/pow
 */
export function toNumberishAtom(from: Numberish, options?: CreateNumberishAtomOptions): NumberishAtom {
  if (isNumberishAtom(from))
    return options?.operations
      ? { ...from, carriedOperations: concat(from.carriedOperations, options.operations) }
      : from
  if (isObject(from) && 'toNumberish' in from) return toNumberishAtom(from.toNumberish(), options)
  if (isNumberishExpression(from)) {
    return parseRPNToNumberishAtom(toRPN(from))
  } else {
    return mergeObjects(toBasicFraction(from), { carriedOperations: options?.operations }) as NumberishAtom
  }
}

/**
 *
 * parse and clear all carried operations
 */
export function parseCarriedActions(n: NumberishAtom): Fraction {
  if (!n.carriedOperations) {
    if (isBasicFraction(n)) return n
    return { denominator: 1n, ...n } satisfies Fraction
  }
  if (!n.carriedOperations) return omit(n, 'carriedOperations') as Fraction
  return n.carriedOperations.reduce((n, action) => {
    const bAtomRaw =
      action?.numberishB != null
        ? isBasicNumberish(action.numberishB)
          ? action.numberishB
          : parseCarriedActions(toNumberishAtom(action.numberishB))
        : undefined
    switch (action.type) {
      case 'add':
        return excutiveAdd(n, bAtomRaw!)
      case 'minus':
        return excutiveMinus(n, bAtomRaw!)
      case 'multiply':
        return excutiveMultiply(n, bAtomRaw!)
      case 'divide':
        return excutiveDivide(n, bAtomRaw!)
      case 'pow':
        return excutivePow(n, bAtomRaw!)
      case 'reciprocal':
        return excutiveReciprocal(n)
    }
    // return switchCase(action.type, {
    //   add: () => excutiveAdd(n, action.numberishB),
    //   minus: () => excutiveMinus(n, action.numberishB),
    //   multiply: () => excutiveMultiply(n, action.numberishB),
    //   divide: () => excutiveDivide(n, action.numberishB),
    //   reciprocal: () => excutiveReciprocal(n),
    //   pow: () => excutivePow(n, action.numberishB)
    // })
  }, omit(n, 'carriedOperations') as Fraction)
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
  if (isNumber(from)) return String(from)
  if (isBigInt(from)) return String(from)
  if (isString(from) && !isNumberishExpression(from)) return from
  const { decimal = 0, numerator, denominator } = fromNumberishAtomToFraction(toNumberishAtom(from))
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

/** aim: easy to read code */
export function createNumberishFromZero(options?: CreateNumberishAtomOptions): NumberishAtom {
  return toNumberishAtom(fractionZero, options)
}
