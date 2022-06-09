import { Numberish, NumberishAtom } from '../typings/constants'
import { toNumberishAtom } from './numberishAtom'

import { padZeroR } from './utils'

/**
 * @example
 * add('9007199254740991.4', '112.4988') //=> '9007199254741103.8988'
 */
export function add(a: Numberish = 0, b: Numberish = 0): NumberishAtom {
  const { decimal: decimalA, all: allA } = toNumberishAtom(a)
  const { decimal: decimalB, all: allB } = toNumberishAtom(b)

  const biggerDecimal = Math.max(decimalB, decimalA)

  return toNumberishAtom({
    decimal: biggerDecimal,
    all:
      BigInt(padZeroR(String(allA), biggerDecimal - decimalA)) +
      BigInt(padZeroR(String(allB), biggerDecimal - decimalB))
  })
}
export function addS(...params: Parameters<typeof add>): string {
  return add(...params).toString()
}

/**
 * @example
 * minus('1.22', '112.3') //=> '-111.08'
 * minus('1.22', '-112.3') //=> '-111.08'
 * minus('9007199254740991.4', '112.4988') //=> '9007199254740878.9012'
 */
export function minus(a: Numberish = 0, b: Numberish = 0): NumberishAtom {
  const { decimal: decimalA, all: allA } = toNumberishAtom(a)
  const { decimal: decimalB, all: allB } = toNumberishAtom(b)
  const biggerDecimal = Math.max(decimalB, decimalA)
  return toNumberishAtom({
    decimal: biggerDecimal,
    all:
      BigInt(padZeroR(String(allA), biggerDecimal - decimalA)) -
      BigInt(padZeroR(String(allB), biggerDecimal - decimalB))
  })
}
export function minusS(...params: Parameters<typeof minus>): string {
  return minus(...params).toString()
}

export function multiply(a: Numberish = 1, b: Numberish = 1): NumberishAtom {
  const { decimal: decimalA, all: allA } = toNumberishAtom(a)
  const { decimal: decimalB, all: allB } = toNumberishAtom(b)
  return toNumberishAtom({
    decimal: decimalA + decimalB,
    all: allA * allB
  })
}
export var mul = multiply
/**
 * @example
 * multiply('1.22', '112.3') //=> '137.006'
 * multiply('9007199254740991.4', '112.4988') //=> '1013299107519255843.31032'
 */
export function multiplyS(...params: Parameters<typeof multiply>): string {
  return multiply(...params).toString()
}
export var mulS = multiplyS

export function divide(
  a: Numberish = 1,
  b: Numberish = 1,
  { decimalPlace = 6 }: { decimalPlace?: number } = {}
): NumberishAtom {
  const { decimal: decimalA, all: allA } = toNumberishAtom(a)
  const { decimal: decimalB, all: allB } = toNumberishAtom(b)
  return toNumberishAtom({
    decimal: decimalA - decimalB + decimalPlace,
    all: BigInt(padZeroR(String(allA), decimalPlace)) / allB
  })
}
export var div = divide

export function divideS(...params: Parameters<typeof divide>): string {
  return divide(...params).toString()
}
export var divS = divideS

export function mod(a: Numberish, b: Numberish): NumberishAtom {
  const divisior = divide(a, b, { decimalPlace: 0 })
  return minus(a, multiply(divisior, b))
}
export function modS(...params: Parameters<typeof mod>): string {
  return mod(...params).toString()
}

export function divideMod(a: Numberish, b: Numberish): [divisior: Numberish, mod: Numberish] {
  const divisior = divide(a, b, { decimalPlace: 0 })
  return [divisior, minus(a, multiply(divisior, b))]
}
