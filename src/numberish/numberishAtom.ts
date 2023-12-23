/**
 * parse all kind of number
 * @module
 */

import {
  BasicNumberish,
  concat,
  excutiveAdd,
  excutiveDivide,
  excutiveMinus,
  excutiveMultiply,
  excutivePow,
  excutiveReciprocal,
  isBigInt,
  isNumber,
  isObject,
  isString,
  mergeObjects,
  Numberish,
  NumberishAction,
  NumberishAtom,
  NumberishAtomRaw,
  NumberishOption,
  omit,
  pick,
  switchCase
} from '..'
import { hasProperty } from '../compare'
import { OneBigint, TenBigint } from './constant'
import { isNumberishExpression, parseRPNToNumberishAtom, toRPN } from './numberExpression'
import { padZeroR, shakeTailingZero } from './utils'

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export const isPartofNumberishAtomRaw = (value: any): value is Pick<NumberishAtomRaw, 'numerator'> =>
  isObject(value) && hasProperty(value, ['numerator'])

export const isNumberishAtom = (value: any): value is NumberishAtom =>
  isPartofNumberishAtomRaw(value) && hasProperty(value, 'carriedOperations')

export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isNumberishAtom(v) || isPartofNumberishAtomRaw(v)
}

function toNumberishAtomRawFromString(str: string): NumberishAtomRaw {
  const [intPart = '', decimalPart = ''] = str.split('.')
  return { decimal: decimalPart.length, numerator: BigInt(intPart + decimalPart), denominator: 1n }
}

function toNumberishAtomRawFromBigInt(n: bigint): NumberishAtomRaw {
  return { numerator: n, decimal: 0, denominator: 1n }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*e[+-]?\d+$/
const isScientificNotation = (str: any): boolean =>
  (isString(String(str)) || isNumber(String(str))) && scientificNotationRegex.test(String(str))
/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { numerator: 42312n, decimal: 2 }
 *  '12' => { numerator: 12n, decimal: 0 }
 */
export function toNumberishAtomRaw(from: BasicNumberish): NumberishAtomRaw {
  if (isPartofNumberishAtomRaw(from)) return { denominator: 1n, decimal: 0, ...from }
  if (isScientificNotation(from)) {
    const [nPart = '', ePart = ''] = String(from).split(/e|E/)
    const nPartNumberishAtom = toNumberishAtomRawFromString(nPart)
    return { ...nPartNumberishAtom, decimal: nPartNumberishAtom.decimal + -Number(ePart) }
  }
  if (isNumber(from)) {
    try {
      // for scientific notation number can be format like 1.34e+24
      return toNumberishAtomRawFromBigInt(BigInt(from))
    } catch {
      return toNumberishAtomRawFromString(String(from))
    }
  }
  if (isBigInt(from)) return toNumberishAtomRawFromBigInt(from)
  return toNumberishAtomRawFromString(String(from))
}

/**
 * toNumberishAtom(1e13) //=> { numerator: 10000000000000n, decimal: 0, denominator: 1n , toString: () => '10000000000000' }
 * @todo numberish Atom is higher than add/minus/multiply/divide/pow
 */
export const toNumberishAtom = (
  from: Numberish,
  options?: {
    operations?: NumberishAction[]
  }
): NumberishAtom => {
  if (isNumberishAtom(from))
    return options?.operations
      ? mergeObjects(from, { carriedOperations: concat(from.carriedOperations, options.operations) })
      : from
  if (isObject(from) && 'toNumberish' in from) return toNumberishAtom(from.toNumberish(), options)
  if (isNumberishExpression(from)) {
    return parseRPNToNumberishAtom(toRPN(from))
  } else {
    return mergeObjects(toNumberishAtomRaw(from), { carriedOperations: options?.operations  }) as NumberishAtom
  }
}

/**
 *
 * parse and clear all carried operations
 */
export function parseCarriedActions(n: NumberishAtom): NumberishAtomRaw {
  return (n.carriedOperations ?? []).reduce((n, action) => {
    switch (action.type) {
      case 'add':
        return excutiveAdd(n, action.numberishB)
      case 'minus':
        return excutiveMinus(n, action.numberishB)
      case 'multiply':
        return excutiveMultiply(n, action.numberishB)
      case 'divide':
        return excutiveDivide(n, action.numberishB)
      case 'pow':
        return excutivePow(n, action.numberishB)
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
  }, omit(n, 'carriedOperations') as NumberishAtomRaw)
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
  const { decimal, numerator, denominator } = parseCarriedActions(toNumberishAtom(from))
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
