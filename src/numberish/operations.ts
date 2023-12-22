import { BasicNumberish, Numberish, NumberishAtom } from '../typings/constants'
import { NumberishOption, toBigint, toNumber } from './changeFormats'
import { isInt, isZero } from './selfIs'
import { TenBigint } from './constant'
import { toNumberishAtom, toNumberishAtomRaw } from './numberishAtom'

/**
 * 1 + 2 = 3
 * @example
 * add('9007199254740991.4', '112.4988') //=> '9007199254741103.8988'
 * @todo should just add virculy
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
      numerator: numratorA * TenBigint ** BigInt(decimalB) + numratorB * TenBigint ** BigInt(decimalA),
      decimal: decimalA + decimalB,
      denominator: denominatorA
    })
  } else {
    return toNumberishAtom({
      numerator:
        numratorA * TenBigint ** BigInt(decimalB) * denominatorB +
        numratorB * TenBigint ** BigInt(decimalA) * denominatorA,
      decimal: decimalA + decimalB,
      denominator: denominatorA * denominatorB
    })
  }
}

/** add immediately */
export function basicAdd(a: BasicNumberish, b: BasicNumberish): BasicNumberish {
  const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtomRaw(a)
  const { decimal: decimalB, numerator: numratorB, denominator: denominatorB } = toNumberishAtomRaw(b)

  if (denominatorA === denominatorB && decimalA === 0 && decimalB === 0) {
    return toNumberishAtomRaw({
      numerator: numratorA + numratorB,
      denominator: denominatorA
    })
  } else if (denominatorA === denominatorB) {
    return toNumberishAtomRaw({
      numerator: numratorA * TenBigint ** BigInt(decimalB) + numratorB * TenBigint ** BigInt(decimalA),
      decimal: decimalA + decimalB,
      denominator: denominatorA
    })
  } else {
    return toNumberishAtomRaw({
      numerator:
        numratorA * TenBigint ** BigInt(decimalB) * denominatorB +
        numratorB * TenBigint ** BigInt(decimalA) * denominatorA,
      decimal: decimalA + decimalB,
      denominator: denominatorA * denominatorB
    })
  }
}

/**
 * {@link add} + toString
 */
export function addS(...params: Parameters<typeof add>): string {
  return add(...params).toString()
}

/**
 * 2 * 3 = 6
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

export var mul = multiply
export function multiplyS(...params: Parameters<typeof multiply>): string {
  return multiply(...params).toString()
}
export var mulS = multiplyS

/**
 *  2 => 1/2
 * @see https://en.wikipedia.org/wiki/Multiplicative_inverse
 */
export function reciprocal(a: Numberish): NumberishAtom {
  const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtom(a)
  return toNumberishAtom({
    numerator: TenBigint ** BigInt(decimalA) * denominatorA,
    decimal: 0,
    denominator: numratorA
  })
}

/**
 * 1 - 2 = -1
 * @example
 * minus('1.22', '112.3') //=> '-111.08'
 * minus('1.22', '-112.3') //=> '113.52'
 * minus('9007199254740991.4', '112.4988') //=> '9007199254740878.9012'
 */
export function minus(a: Numberish, b: Numberish): NumberishAtom {
  return add(a, multiply(-1, b))
}

/**
 * {@link minus} + toString
 */
export function minusS(...params: Parameters<typeof minus>): string {
  return minus(...params).toString()
}

/**
 * 1 / 2 = 0.5
 * @example
 * divide('1.22', '112.3') //=> '0.010863'
 * divide('1.22', '-112.3') //=> '-0.010863'
 */
export function divide(a: Numberish, b: Numberish): NumberishAtom {
  return mul(a, reciprocal(b))
}
export var div = divide

/**
 * {@link divide} + toString
 */
export function divideS(a: Numberish, b: Numberish, options?: NumberishOption): string {
  return divide(a, b).toString(options)
}
export var divS = divideS

/**
 * 1 % 2 = 1
 * @example
 * mod('1.22', '112.3') //=> '1.22'
 * mod('1.22', '-112.3') //=> '1.22'
 */
export function mod(a: Numberish, b: Numberish): NumberishAtom {
  return divideMod(a, b)[1]
}

/**
 * {@link mod} + toString
 */
export function modS(...params: Parameters<typeof mod>): string {
  return mod(...params).toString()
}

/**
 * {@link divide} + {@link mod}
 * @example
 * divideMod('1.22', '112.3') //=> ['0', '1.22']
 * divideMod('1.22', '-112.3') //=> ['-0', '1.22']
 */
export function divideMod(a: Numberish, b: Numberish): [divisior: bigint, mod: NumberishAtom] {
  const n = divide(a, b)
  const divisior = n.numerator / (n.denominator * TenBigint ** BigInt(n.decimal))
  const rest = minus(a, multiply(divisior, b))
  return [divisior, rest]
}

/**
 *  2 ^ 3 = 8
 * @param a any numberish
 * @param b if b is int or zero, always ok. or it must can cover to js pure number
 */
export function pow(a: Numberish, b: Numberish): NumberishAtom {
  if (a === 1 || a === 1n || a === '1') return toNumberishAtom(1)
  if (a === 0 || a === 0n || a === '0') return toNumberishAtom(0)
  if (b === 1 || b === 1n || b === '1') return toNumberishAtom(a)
  if (b === 0 || b === 0n || b === '0') return toNumberishAtom(1)

  const bIsInt = isInt(b)

  if (bIsInt) {
    const { decimal: decimalA, numerator: numratorA, denominator: denominatorA } = toNumberishAtom(a)
    const exponent = toBigint(b)
    return toNumberishAtom({
      numerator: numratorA ** exponent,
      decimal: decimalA ** Number(exponent),
      denominator: denominatorA ** exponent
    })
  } else {
    return toNumberishAtom(Math.pow(toNumber(a), toNumber(b)))
  }
}
