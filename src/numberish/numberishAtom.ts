/**
 * parse all kind of number
 * @module
 */

import { isBigInt, isNumber, isObject, isString, Numberish, NumberishAtom, NumberishAtomRaw } from '..'
import { hasProperty } from '../compare'
import { NumberishOption, toString } from './changeFormats'
import { OneBigint } from './constant'

export const stringNumberRegex = /(?<sign>-|\+?)(?<int>\d*)\.?(?<dec>\d*)/

export const isNumberishAtomRaw = (value: any): value is NumberishAtomRaw =>
  isObject(value) && hasProperty(value, ['numerator'])

export const isNumberishAtom = (value: any): value is NumberishAtom =>
  isNumberishAtomRaw(value) && hasProperty(value, ['decimal', 'denominator', 'toString'])

export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isNumberishAtom(v) || isNumberishAtomRaw(v)
}
/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { numerator: 42312n, decimal: 2 }
 *  '12' => { numerator: 12n, decimal: 0 }
 */
export function toNumberishAtomRaw(from: Numberish | { toNumberishAtom: () => NumberishAtom }): NumberishAtomRaw {
  if (isNumberishAtomRaw(from)) return from
  if (isScientificNotation(from)) {
    const [nPart = '', ePart = ''] = String(from).split(/e|E/)
    const nPartNumberishAtom = toNumberishAtomRawFromString(nPart)
    const decimal = nPartNumberishAtom.decimal ?? 0 - Number(ePart)
    return decimal ? { decimal, ...nPartNumberishAtom } : nPartNumberishAtom
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
 */
export const toNumberishAtom = (from: Parameters<typeof toNumberishAtomRaw>[0]): NumberishAtom => {
  if (isNumberishAtom(from)) return from
  if (isObject(from) && 'toNumberishAtom' in from) return from.toNumberishAtom()

  const atom = toNumberishAtomRaw(from)
  return {
    ...atom,
    //TODO: add toExpression()
    // toExpression: () => toString(atom),
    toString: (options?: NumberishOption) => toString(atom, options),
    decimal: atom.decimal ?? 0,
    denominator: atom.denominator ?? OneBigint
  }
}

function toNumberishAtomRawFromString(str: string): NumberishAtomRaw {
  const [intPart = '', decimalPart = ''] = str.split('.')
  return decimalPart
    ? { decimal: decimalPart.length, numerator: BigInt(intPart + decimalPart) }
    : { numerator: BigInt(intPart) }
}

function toNumberishAtomRawFromBigInt(n: bigint): NumberishAtomRaw {
  return { numerator: n }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*e[+-]?\d+$/
const isScientificNotation = (str: any): boolean =>
  (isString(String(str)) || isNumber(String(str))) && scientificNotationRegex.test(String(str))
