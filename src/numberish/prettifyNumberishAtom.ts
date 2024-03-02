import { toFraction } from './numberishAtom'
import { Fraction } from './types'

function padTailZero(n: string | bigint | number, zeroLength?: number) {
  if (!zeroLength) return String(n)
  return zeroLength > 0 ? String(n) + ''.padEnd(zeroLength, '0') : String(n).slice(0, zeroLength)
}
function getTailZeroLength(n: string | bigint | number) {
  return String(n).match(/0+$/)?.[0].length ?? 0
}
/**
 * @example
 * prettifyNumberishAtom({ numerator: 100n, denominator: 133000n, decimal: 1}) //=> { numerator: 100n, denominator: 133000n}
 */
function prettifyNumberishAtomWithDecimal(n: Fraction): { numerator: bigint; denominator: bigint } {
  if (!n.decimal) return { numerator: n.numerator, denominator: n.denominator ?? 1n }

  let finalNumerator = n.numerator
  let finalDenominator = n.denominator ?? 1n
  let finalDecimal = n.decimal ?? 0

  const numberatorZeroLength = getTailZeroLength(finalNumerator)
  if (finalDecimal && finalDecimal > 0) {
    if (numberatorZeroLength >= finalDecimal) {
      finalNumerator = BigInt(padTailZero(finalNumerator, -finalDecimal))
      finalDecimal = 0
    } else {
      if (numberatorZeroLength) {
        finalNumerator = BigInt(padTailZero(finalNumerator, -numberatorZeroLength))
      }
      finalDenominator = BigInt(padTailZero(finalDenominator, finalDecimal - numberatorZeroLength))
      finalDecimal = 0
    }
  }

  const denominatorZeroLength = getTailZeroLength(finalDenominator)
  if (finalDecimal && finalDecimal < 0) {
    if (denominatorZeroLength >= -finalDecimal) {
      finalDenominator = BigInt(padTailZero(finalDenominator, finalDecimal))
      finalDecimal = 0
    } else {
      if (denominatorZeroLength) {
        finalDenominator = BigInt(padTailZero(finalDenominator, -denominatorZeroLength))
      }
      finalNumerator = BigInt(padTailZero(finalNumerator, -finalDecimal - denominatorZeroLength))
      finalDecimal = 0
    }
  }
  return {
    numerator: finalNumerator,
    denominator: finalDenominator
  }
}
/**
 * @see https://www.cnblogs.com/Sabre/p/9711478.html
 * @example
 * prettifyNumberishAtom({ numerator: 100n, denominator: 133000n}) //=> { numerator: 1n, denominator: 1330n}
 */
function prettifyNumberishAtomWith10(n: { numerator: bigint; denominator: bigint }): {
  numerator: bigint
  denominator: bigint
} {
  const canNumeratorMod10RestLength = String(n.numerator).endsWith('0')
    ? String(n.numerator).match(/0+$/)?.[0].length
    : 0
  const canDenominatorMod10RestLength = String(n.denominator).endsWith('0')
    ? String(n.denominator).match(/0+$/)?.[0].length
    : 0
  if (canNumeratorMod10RestLength && canDenominatorMod10RestLength) {
    const restLength = Math.min(canNumeratorMod10RestLength, canDenominatorMod10RestLength)
    return {
      numerator: BigInt(padTailZero(n.numerator, -restLength)),
      denominator: BigInt(padTailZero(n.denominator, -restLength))
    }
  }
  return n
}
function prettifyNumberishAtom(n: Fraction): Fraction {
  return toFraction(prettifyNumberishAtomWith10(prettifyNumberishAtomWithDecimal(n)))
}

