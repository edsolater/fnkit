/**
 * parse all kind of number
 * @module
 */

import {
  isObject,
  isNumber,
  isBigInt,
  isString,
  Numberish,
  NumberishAtom,
  NumberishAtomRaw
} from '..'
import { hasProperty } from '../compare'
import { toString } from './changeFormat'
import { shakeTailingZero } from './utils'

export const stringNumberRegex = /(?<sign>-?)(?<int>\d*)\.?(?<dec>\d*)/

const isNumberishAtom = (value: any): value is NumberishAtom =>
  isObject(value) && hasProperty(value, ['decimal', 'all'])

/**
 * @convention number element = decimal + getAllNumber
 * @example
 *  '423.12' => { decimal: 2, allNumber: '42312' }
 *  '12' => { decimal: 0, allNumber: '12' }
 */
function toNumberishAtomRaw(
  from: Numberish | NumberishAtom | { toNumberishAtom: () => NumberishAtom }
): NumberishAtomRaw {
  if (isScientificNotation(from)) {
    const [nPart = '', ePart = ''] = String(from).split('e')
    const nPartNumberishAtom = toNumberishAtomFromString(nPart)
    const all = nPartNumberishAtom.all
    const decimal = nPartNumberishAtom.decimal - Number(ePart)
    const rawNumberishAtom = { decimal, all }
    return { ...rawNumberishAtom }
  }
  if (isObject(from)) {
    if ('toNumberishAtom' in from) return from.toNumberishAtom()
  }
  if (isNumberishAtom(from)) return from
  if (isNumber(from)) {
    try {
      // for scientific notation number can be format like 1.34e+24
      return toNumberishAtomFromString(String(BigInt(from)))
    } catch {
      return toNumberishAtomFromString(String(from))
    }
  }
  if (isBigInt(from)) return toNumberishAtomFromString(String(from))
  else {
    const parsedString = String(from).match(/(?<sign>-?)(?<int>\d*)\.?(?<dec>\d*)/)
    if (!parsedString) return toNumberishAtomFromString('')
    const { sign = '', int = '', dec = '' } = parsedString.groups ?? {}
    const str = shakeTailingZero(dec ? `${sign}${int || '0'}.${dec}` : `${sign}${int}`)
    return toNumberishAtomFromString(str)
  }
}

export const toNumberishAtom = (from: Parameters<typeof toNumberishAtomRaw>[0]): NumberishAtom => {
  const atom = toNumberishAtomRaw(from)
  return { ...atom, toString: () => toString(atom) }
}

function toNumberishAtomFromString(str: string) {
  const [intPart = '', decimalPart = ''] = str.split('.')
  const numberishAtomRaw = { decimal: decimalPart.length, all: BigInt(intPart + decimalPart) }
  return { ...numberishAtomRaw, toString: () => toString(numberishAtomRaw) }
}

const scientificNotationRegex = /^[+-]?\d+\.?\d*e[+-]?\d+$/
export const numberishAtom = toNumberishAtom
export const isScientificNotation = (str: any): boolean =>
  (isString(String(str)) || isNumber(String(str))) && scientificNotationRegex.test(String(str))
