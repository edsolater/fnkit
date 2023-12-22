/**
 * parse all kind of number
 * @module
 */

import { BasicNumberish, isBigInt, isNumber, isObject, isString, Numberish, NumberishAtom, NumberishAtomRaw } from '..'
import { hasProperty } from '../compare'
import { NumberishOption, toString } from './changeFormats'
import { OneBigint } from './constant'

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export const isPartofNumberishAtomRaw = (value: any): value is Pick<NumberishAtomRaw, 'numerator'> =>
  isObject(value) && hasProperty(value, ['numerator'])

export const isNumberishAtom = (value: any): value is NumberishAtom =>
  isPartofNumberishAtomRaw(value) && hasProperty(value, ['decimal', 'denominator', 'toString'])

export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isNumberishAtom(v) || isPartofNumberishAtomRaw(v)
}
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
export const toNumberishAtom = (from: Numberish): NumberishAtom => {
  if (isNumberishAtom(from)) return from
  if (isObject(from) && 'toNumberish' in from) return toNumberishAtom(from.toNumberish())

  // 💩 not mix math expression yet!
  const atom = toNumberishAtomRaw(from)
  return {
    ...atom,
    cachedOperations: [],
    toString: (options?: NumberishOption) => toString(atom, options),
    decimal: atom.decimal ?? 0,
    denominator: atom.denominator ?? OneBigint
  }
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
