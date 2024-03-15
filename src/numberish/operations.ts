import { isNumber, isString } from "../dataType"
import { NumberishOption, toBigint, toNumber } from "./changeFormats"
import { TenBigint } from "./constant"
import { toFraction, toStringNumber } from "./numberishAtom"
import { buildFromAnatomyNumberInfo, parseAnatomyNumberInfo } from "./parseAnatomyNumberInfo"
import { isBigIntable, isInt, isNumberSafeInteger } from "./selfIs"
import { trimZero } from "./trimZero"
import { BasicNumberish, Fraction, Numberish } from "./types"

type MathOperateOption = {
  /**
   * will always not number
   * @deprecated should always auto-exact. No need to set this maunally
   */
  exact?: boolean
}

/**
 * 1 + 2 = 3
 * @todo should test performance
 * @example
 * add('9007199254740991.4', '112.4988') //=> '9007199254741103.8988'
 * @todo should just add virculy
 */
export function add(a: Numberish, b: Numberish, options?: MathOperateOption): Numberish {
  if (!options?.exact && isNumberSafeInteger(a) && isNumberSafeInteger(b)) {
    const output = a + b
    if (!isNumberSafeInteger(output)) {
      return exactAdd(a, b)
    }
    return output
  } else if (isBigIntable(a) && isBigIntable(b)) {
    return BigInt(a) + BigInt(b)
  } else {
    return exactAdd(a, b)
  }
}
function exactAdd(a: Numberish, b: Numberish): Numberish {
  const aFraction = toFraction(a)
  const bFraction = toFraction(b)
  return excutiveAdd(aFraction, bFraction)
}
export function excutiveAdd(a: BasicNumberish, b: BasicNumberish): Fraction {
  const { decimal: decimalA = 0, numerator: numratorA, denominator: denominatorA = 1n } = toFraction(a)
  const { decimal: decimalB = 0, numerator: numratorB, denominator: denominatorB = 1n } = toFraction(b)

  if (denominatorA === denominatorB && decimalA === 0 && decimalB === 0) {
    return toFraction({
      numerator: numratorA + numratorB,
      denominator: denominatorA,
    })
  } else if (denominatorA === denominatorB) {
    return toFraction({
      numerator: numratorA * TenBigint ** BigInt(decimalB) + numratorB * TenBigint ** BigInt(decimalA),
      decimal: decimalA + decimalB,
      denominator: denominatorA,
    })
  } else {
    return toFraction({
      numerator:
        numratorA * TenBigint ** BigInt(decimalB) * denominatorB +
        numratorB * TenBigint ** BigInt(decimalA) * denominatorA,
      decimal: decimalA + decimalB,
      denominator: denominatorA * denominatorB,
    })
  }
}

/**
 * {@link add} + toString
 */
export function addS(...params: Parameters<typeof add>): string {
  return toStringNumber(add(...params))
}

/**
 * 2 * 3 = 6
 * @example
 * multiply('1.22', '112.3') //=> '137.006'
 * multiply('9007199254740991.4', '112.4988') //=> '1013299107519255843.31032'
 */
export function multiply(a: Numberish, b: Numberish, options?: MathOperateOption): Numberish {
  if (!options?.exact && isNumberSafeInteger(a) && isNumberSafeInteger(b)) {
    const output = a * b
    if (!isNumberSafeInteger(output)) {
      return exactMultiply(a, b)
    }
    return output
  } else if (isBigIntable(a) && isBigIntable(b)) {
    return BigInt(a) * BigInt(b)
  } else {
    return exactMultiply(a, b)
  }
}
function exactMultiply(a: Numberish, b: Numberish): Numberish {
  const aFraction = toFraction(a)
  const bFraction = toFraction(b)
  return excutiveMultiply(aFraction, bFraction)
}
export function excutiveMultiply(a: BasicNumberish, b: BasicNumberish): Fraction {
  const { decimal: decimalA = 0, numerator: numratorA, denominator: denominatorA = 1n } = toFraction(a)
  const { decimal: decimalB = 0, numerator: numratorB, denominator: denominatorB = 1n } = toFraction(b)
  return toFraction({
    numerator: numratorA * numratorB,
    decimal: decimalA + decimalB,
    denominator: denominatorA * denominatorB,
  })
}

export var mul = multiply
export function multiplyS(...params: Parameters<typeof multiply>): string {
  return toStringNumber(multiply(...params))
}
export var mulS = multiplyS

/**
 *  2 => 1/2
 * @see https://en.wikipedia.org/wiki/Multiplicative_inverse
 */
export function reciprocal(a: Numberish): Fraction {
  const aFraction = toFraction(a)
  return excutiveReciprocal(aFraction)
}
export function excutiveReciprocal(a: BasicNumberish): Fraction {
  const { decimal = 0, numerator, denominator = 1n } = toFraction(a)
  return toFraction({
    numerator: denominator,
    decimal: -decimal,
    denominator: numerator,
  })
}

/**
 * 1 - 2 = -1
 * @example
 * minus('1.22', '112.3') //=> '-111.08'
 * minus('1.22', '-112.3') //=> '113.52'
 * minus('9007199254740991.4', '112.4988') //=> '9007199254740878.9012'
 */
export function minus(a: Numberish, b: Numberish, options?: MathOperateOption): Numberish {
  if (!options?.exact && isNumberSafeInteger(a) && isNumberSafeInteger(b)) {
    const output = a - b
    if (!isNumberSafeInteger(output)) {
      return exactMinus(a, b)
    }
    return output
  } else if (isBigIntable(a) && isBigIntable(b)) {
    return BigInt(a) - BigInt(b)
  } else {
    return exactMinus(a, b)
  }
}
function exactMinus(a: Numberish, b: Numberish): Numberish {
  const aFraction = toFraction(a)
  const bFraction = toFraction(b)
  return excutiveMinus(aFraction, bFraction)
}
export function excutiveMinus(a: BasicNumberish, b: BasicNumberish): Fraction {
  return excutiveAdd(a, excutiveMultiply(-1, b))
}

/**
 * {@link minus} + toString
 */
export function minusS(...params: Parameters<typeof minus>): string {
  return toStringNumber(minus(...params))
}

/**
 * 1 / 2 = 0.5
 * @example
 * divide('1.22', '112.3') //=> '0.010863'
 * divide('1.22', '-112.3') //=> '-0.010863'
 */
export function divide(a: Numberish, b: Numberish): Numberish {
  return exactDivide(a, b)
}

function exactDivide(a: Numberish, b: Numberish): Numberish {
  const aFraction = toFraction(a)
  const bFraction = toFraction(b)
  return excutiveDivide(aFraction, bFraction)
}
export function excutiveDivide(a: BasicNumberish, b: BasicNumberish): Fraction {
  return excutiveMultiply(a, excutiveReciprocal(b))
}
export var div = divide

/**
 * {@link divide} + toString
 */
export function divideS(a: Numberish, b: Numberish, options?: NumberishOption): string {
  return toStringNumber(divide(a, b), options)
}
export var divS = divideS

/**
 * not basic numberish:method
 * 1 % 2 = 1
 * @example
 * mod('1.22', '112.3') //=> '1.22'
 * mod('1.22', '-112.3') //=> '1.22'
 */
export function mod(a: Numberish, b: Numberish): Numberish {
  return divideMod(a, b)[1]
}

/**
 * {@link mod} + toString
 */
export function modS(...params: Parameters<typeof mod>): string {
  return toStringNumber(mod(...params))
}

/**
 * not basic numberish:method
 * {@link divide} + {@link mod}
 * @example
 * divideMod('1.22', '112.3') //=> ['0', '1.22']
 * divideMod('1.22', '-112.3') //=> ['-0', '1.22']
 */
export function divideMod(a: Numberish, b: Numberish): [divisior: bigint, mod: Numberish] {
  const n = divide(a, b)
  const { numerator, denominator = 1n, decimal = 0 } = toFraction(n)
  const divisior = numerator / (decimal ? denominator * TenBigint ** BigInt(decimal) : denominator)
  const rest = minus(a, multiply(divisior, b))
  return [divisior, rest]
}

/**
 *  2 ^ 3 = 8
 * @param a any numberish
 * @param b if b is int or zero, always ok. or it must can cover to js pure number
 */
export function pow(a: Numberish, b: Numberish): Numberish {
  if (isNumber(a) && isNumber(b)) {
    const output = a ** b
    if (output > Number.MAX_SAFE_INTEGER) {
      return exactPow(a, b)
    }
    return output
  } else {
    return exactPow(a, b)
  }
}
function exactPow(a: Numberish, b: Numberish): Numberish {
  const aFraction = toFraction(a)
  const bFraction = toFraction(b)
  return excutivePow(aFraction, bFraction)
}

export function excutivePow(a: Numberish, b: Numberish): Fraction {
  if (a === 1 || a === 1n || a === "1") return toFraction(1)
  if (a === 0 || a === 0n || a === "0") return toFraction(0)
  if (b === 1 || b === 1n || b === "1") return toFraction(a)
  if (b === 0 || b === 0n || b === "0") return toFraction(1)
  const bIsInt = isInt(b)
  if (bIsInt) {
    const { decimal: decimalA = 0, numerator: numratorA, denominator: denominatorA = 1n } = toFraction(a)
    const exponent = toBigint(b)
    return toFraction({
      numerator: numratorA ** exponent,
      decimal: decimalA ** Number(exponent),
      denominator: denominatorA ** exponent,
    })
  } else {
    return toFraction(Math.pow(toNumber(a), toNumber(b)))
  }
}

/**
 * @example
 * applyDecimal('123', 2) //=> '12300'
 */
export function applyDecimal(n: Numberish, decimal: number): Numberish {
  if (decimal === 0) return n

  if (isBigIntable(n)) {
    const nString = isString(n) ? n : String(BigInt(n))
    const nCount = nString.length
    if (decimal >= nCount) {
      return trimZero("0." + "0".repeat(decimal - nCount) + nString)
    } else if (decimal < 0) {
      return nString + "0".repeat(-decimal)
    } else {
      return `${nString.slice(0, -decimal)}.${nString.slice(-decimal)}`
    }
  }
  const anatomy = parseAnatomyNumberInfo(n)
  return buildFromAnatomyNumberInfo({ ...anatomy, e: (anatomy.e ?? 0) + decimal })
}
