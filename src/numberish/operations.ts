import { isArray } from '../dataType'
import { BasicNumberish, Numberish, NumberishAtom, Fraction } from '../typings/constants'
import { NumberishOption, toBigint, toNumber } from './changeFormats'
import { TenBigint } from './constant'
import {
  createNumberishFromZero,
  toNumberishAtom,
  toBasicFraction,
  toString,
  fromNumberishAtomToFraction
} from './numberishAtom'
import { isInt } from './selfIs'

/**
 * 1 + 2 = 3
 * @todo should test performance
 * @example
 * add('9007199254740991.4', '112.4988') //=> '9007199254741103.8988'
 * @todo should just add virculy
 */
export function add(a: Numberish, b: Numberish): NumberishAtom {
  return createNumberishFromZero({
    operations: [
      { type: 'add', numberishB: a },
      { type: 'add', numberishB: b }
    ]
  })
}
export function excutiveAdd(a: BasicNumberish, b: BasicNumberish): Fraction {
  const { decimal: decimalA = 0, numerator: numratorA, denominator: denominatorA } = toBasicFraction(a)
  const { decimal: decimalB = 0, numerator: numratorB, denominator: denominatorB } = toBasicFraction(b)

  if (denominatorA === denominatorB && decimalA === 0 && decimalB === 0) {
    return toBasicFraction({
      numerator: numratorA + numratorB,
      denominator: denominatorA,
      decimal: 0
    })
  } else if (denominatorA === denominatorB) {
    return toBasicFraction({
      numerator: numratorA * TenBigint ** BigInt(decimalB) + numratorB * TenBigint ** BigInt(decimalA),
      decimal: decimalA + decimalB,
      denominator: denominatorA
    })
  } else {
    return toBasicFraction({
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
  return toString(add(...params))
}

/**
 * 2 * 3 = 6
 * @example
 * multiply('1.22', '112.3') //=> '137.006'
 * multiply('9007199254740991.4', '112.4988') //=> '1013299107519255843.31032'
 */
export function multiply(a: Numberish, b: Numberish): NumberishAtom {
  return toNumberishAtom(a, { operations: [{ type: 'multiply', numberishB: b }] })
}
export function excutiveMultiply(a: BasicNumberish, b: BasicNumberish): Fraction {
  const { decimal: decimalA = 0, numerator: numratorA, denominator: denominatorA } = toBasicFraction(a)
  const { decimal: decimalB = 0, numerator: numratorB, denominator: denominatorB } = toBasicFraction(b)
  return toBasicFraction({
    numerator: numratorA * numratorB,
    decimal: decimalA + decimalB,
    denominator: denominatorA * denominatorB
  })
}

export var mul = multiply
export function multiplyS(...params: Parameters<typeof multiply>): string {
  return toString(multiply(...params))
}
export var mulS = multiplyS

/**
 *  2 => 1/2
 * @see https://en.wikipedia.org/wiki/Multiplicative_inverse
 */
export function reciprocal(a: Numberish): NumberishAtom {
  return toNumberishAtom(a, { operations: [{ type: 'reciprocal' }] })
}
export function excutiveReciprocal(a:BasicNumberish): Fraction {
  const { decimal = 0, numerator, denominator } = toBasicFraction(a)
  return toBasicFraction({
    numerator: denominator,
    decimal: -decimal,
    denominator: numerator
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
  return createNumberishFromZero({
    operations: [
      { type: 'add', numberishB: a },
      { type: 'minus', numberishB: b }
    ]
  })
}
export function excutiveMinus(a: BasicNumberish, b: BasicNumberish): Fraction {
  return excutiveAdd(a, excutiveMultiply(-1, b))
}

/**
 * {@link minus} + toString
 */
export function minusS(...params: Parameters<typeof minus>): string {
  return toString(minus(...params))
}

/**
 * 1 / 2 = 0.5
 * @example
 * divide('1.22', '112.3') //=> '0.010863'
 * divide('1.22', '-112.3') //=> '-0.010863'
 */
export function divide(a: Numberish, b: Numberish): NumberishAtom {
  return createNumberishFromZero({
    operations: [
      { type: 'add', numberishB: a },
      { type: 'divide', numberishB: b }
    ]
  })
}
export function excutiveDivide(a: BasicNumberish, b: BasicNumberish): Fraction {
  return excutiveMultiply(a, excutiveReciprocal(b))
}
export var div = divide

/**
 * {@link divide} + toString
 */
export function divideS(a: Numberish, b: Numberish, options?: NumberishOption): string {
  return toString(divide(a, b), options)
}
export var divS = divideS

/**
 * not basic numberish:method
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
  return toString(mod(...params))
}

/**
 * not basic numberish:method
 * {@link divide} + {@link mod}
 * @example
 * divideMod('1.22', '112.3') //=> ['0', '1.22']
 * divideMod('1.22', '-112.3') //=> ['-0', '1.22']
 */
export function divideMod(a: Numberish, b: Numberish): [divisior: bigint, mod: NumberishAtom] {
  const n = divide(a, b)
  console.log('n00: ', a, b,Array.isArray(n.carriedOperations))
  const { denominator, decimal = 0 } = fromNumberishAtomToFraction(n)
  console.log('denominator: ', denominator)
  const divisior = n.numerator / (denominator * TenBigint ** BigInt(decimal))
  const rest = minus(a, multiply(divisior, b))
  return [divisior, rest]
}

/**
 *  2 ^ 3 = 8
 * @param a any numberish
 * @param b if b is int or zero, always ok. or it must can cover to js pure number
 */
export function pow(a: Numberish, b: Numberish): NumberishAtom {
  return toNumberishAtom(a, { operations: [{ type: 'pow', numberishB: b }] })
}

export function excutivePow(a: Numberish, b: Numberish): Fraction {
  if (a === 1 || a === 1n || a === '1') return toBasicFraction(1)
  if (a === 0 || a === 0n || a === '0') return toBasicFraction(0)
  if (b === 1 || b === 1n || b === '1') return fromNumberishAtomToFraction(toNumberishAtom(a))
  if (b === 0 || b === 0n || b === '0') return toBasicFraction(1)
  const bIsInt = isInt(b)
  if (bIsInt) {
    const {
      decimal: decimalA = 0,
      numerator: numratorA,
      denominator: denominatorA
    } = fromNumberishAtomToFraction(toNumberishAtom(a))
    const exponent = toBigint(b)
    return toBasicFraction({
      numerator: numratorA ** exponent,
      decimal: decimalA ** Number(exponent),
      denominator: denominatorA ** exponent
    })
  } else {
    return toBasicFraction(Math.pow(toNumber(a), toNumber(b)))
  }
}
