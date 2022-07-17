import { Numberish, NumberishAtom } from '../typings/constants'
import { NumberishOption } from './changeFormat'
import { toNumberishAtom } from './numberishAtom'

/**
 * @example
 * add('9007199254740991.4', '112.4988') //=> '9007199254741103.8988'
 */
export function add(a: Numberish, b: Numberish): NumberishAtom {
  const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtom(a)
  const { decimal: decimalB, numerator: numratorB, denominator: denominatorB } = toNumberishAtom(b)

  if (denominatorA === denominatorB && decimalA === 0 && decimalB === 0) {
    return toNumberishAtom({
      numerator: numratorA + numratorB,
      denominator: denominatorA
    })
  } else if (denominatorA === denominatorB) {
    return toNumberishAtom({
      numerator: numratorA * 10n ** BigInt(decimalB) + numratorB * 10n ** BigInt(decimalA),
      decimal: decimalA + decimalB,
      denominator: denominatorA
    })
  } else {
    return toNumberishAtom({
      numerator:
        numratorA * 10n ** BigInt(decimalB) * denominatorB + numratorB * 10n ** BigInt(decimalA) * denominatorA,
      decimal: decimalA + decimalB,
      denominator: denominatorA * denominatorB
    })
  }
}

/**
 * @example
 * multiply('1.22', '112.3') //=> '137.006'
 * multiply('9007199254740991.4', '112.4988') //=> '1013299107519255843.31032'
 */
export function multiply(a: Numberish, b: Numberish): NumberishAtom {
  const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtom(a)
  const { decimal: decimalB, numerator: numratorB, denominator: denominatorB } = toNumberishAtom(b)
  return toNumberishAtom({
    numerator: numratorA * numratorB,
    decimal: decimalA + decimalB,
    denominator: denominatorA * denominatorB
  })
}

/**
 * @see https://en.wikipedia.org/wiki/Multiplicative_inverse
 */
export function reciprocal(a: Numberish): NumberishAtom {
  const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtom(a)
  return toNumberishAtom({ numerator: 10n ** BigInt(decimalA) * denominatorA, decimal: 0, denominator: numratorA })
}

/**
 * @example
 * minus('1.22', '112.3') //=> '-111.08'
 * minus('1.22', '-112.3') //=> '113.52'
 * minus('9007199254740991.4', '112.4988') //=> '9007199254740878.9012'
 */
export function minus(a: Numberish, b: Numberish): NumberishAtom {
  return add(a, multiply(-1, b))
}
export function minusS(...params: Parameters<typeof minus>): string {
  return minus(...params).toString()
}

/**
 * @example
 * divide('1.22', '112.3') //=> '0.010863'
 * divide('1.22', '-112.3') //=> '-0.010863'
 */
export function divide(a: Numberish, b: Numberish): NumberishAtom {
  return mul(a, reciprocal(b))
}
export var div = divide

export function divideS(a: Numberish, b: Numberish, options?: NumberishOption): string {
  return divide(a, b).toString(options)
}
export var divS = divideS

export function mod(a: Numberish, b: Numberish): NumberishAtom {
  return divideMod(a, b)[1]
}
export function modS(...params: Parameters<typeof mod>): string {
  return mod(...params).toString()
}

export function divideMod(a: Numberish, b: Numberish): [divisior: bigint, mod: NumberishAtom] {
  const n = divide(a, b)
  const divisior = n.numerator / (n.denominator * 10n ** BigInt(n.decimal))
  return [divisior, minus(a, multiply(divisior, b))]
}

export function addS(...params: Parameters<typeof add>): string {
  return add(...params).toString()
}

export var mul = multiply
export function multiplyS(...params: Parameters<typeof multiply>): string {
  return multiply(...params).toString()
}
export var mulS = multiplyS
