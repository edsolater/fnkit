/**
 * parse all kind of number
 * @module
 */

import { isBigInt, isNumber, isObject, isString, Numberish, NumberishAtom, NumberishAtomRaw } from '..'
import { hasProperty } from '../compare'
import { NumberishOption, toString } from './changeFormat'

export const stringNumberRegex = /(?<sign>-?)(?<int>\d*)\.?(?<dec>\d*)/

const isNumberishAtomRaw = (value: any): value is NumberishAtomRaw =>
  isObject(value) && hasProperty(value, ['numerator'])

const isNumberishAtom = (value: any): value is NumberishAtom =>
  isNumberishAtomRaw(value) && hasProperty(value, ['decimal', 'denominator', 'toString'])

export function isNumberish(v: unknown): v is Numberish {
  return isNumber(v) || isString(v) || isNumberishAtom(v) || isNumberishAtomRaw(v)
}
/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { decimal: 2, allNumber: '42312' }
 *  '12' => { decimal: 0, allNumber: '12' }
 */
function toNumberishAtomRaw(from: Numberish | { toNumberishAtom: () => NumberishAtom }): NumberishAtomRaw {
  if (isNumberishAtomRaw(from)) return from

  if (isScientificNotation(from)) {
    const [nPart = '', ePart = ''] = String(from).split('e')
    const nPartNumberishAtom = toNumberishAtomRawFromString(nPart)
    const decimal = nPartNumberishAtom.decimal ?? 0 - Number(ePart)
    return { decimal, ...nPartNumberishAtom }
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
  else {
    return toNumberishAtomRawFromString(String(from))
    // const parsedString = String(from).match(/(?<sign>-?)(?<int>\d*)\.?(?<dec>\d*)/)
    // if (!parsedString) return toNumberishAtomRawFromString('')
    // const { sign = '', int = '', dec = '' } = parsedString.groups ?? {}
    // const str = shakeTailingZero(dec ? `${sign}${int || '0'}.${dec}` : `${sign}${int}`)
    // return toNumberishAtomRawFromString(str)
  }
}

export const toNumberishAtom = (from: Parameters<typeof toNumberishAtomRaw>[0]): NumberishAtom => {
  if (isNumberishAtom(from)) return from
  if (isObject(from) && 'toNumberishAtom' in from) return from.toNumberishAtom()

  const atom = toNumberishAtomRaw(from)
  return {
    ...atom,
    toString: (options?: NumberishOption) => toString(atom, options),
    decimal: atom.decimal ?? 0,
    denominator: atom.denominator ?? 1n
  }
}

function toNumberishAtomRawFromString(str: string): NumberishAtomRaw {
  const [intPart = '', decimalPart = ''] = str.split('.')
  return { decimal: decimalPart.length, numerator: BigInt(intPart + decimalPart) }
}
function toNumberishAtomRawFromBigInt(n: bigint): NumberishAtomRaw {
  return { numerator: n }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*e[+-]?\d+$/
const isScientificNotation = (str: any): boolean =>
  (isString(String(str)) || isNumber(String(str))) && scientificNotationRegex.test(String(str))
