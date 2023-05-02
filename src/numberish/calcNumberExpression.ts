/**
 * @see https://m.xp.cn/b.php/107696.html
 */

import { Numberish, NumberishAtom, NumberishAtomRaw } from '../typings'
import { isNumberishAtom, isNumberishAtomRaw, toNumberishAtom } from './numberishAtom'
import { add, div, minus, mul } from './operations'

function getPrioratyOfChar(value: string) {
  switch (value) {
    case '+':
    case '-':
      return 1
    case '*':
    case '/':
      return 2
    default:
      return 0
  }
}

function isChar1PrioratyHigher(c1: string, c2: string) {
  return getPrioratyOfChar(c1) <= getPrioratyOfChar(c2)
}

/**
 * @see https://zh.wikipedia.org/wiki/%E9%80%86%E6%B3%A2%E5%85%B0%E8%A1%A8%E7%A4%BA%E6%B3%95
 */
type RPNQueue = RPNItem[]

type RPNItem =
  | { isOperator: true; value: '+' | '-' | '*' | '/' }
  | { isOperator: false; value: number | string | bigint | NumberishAtomRaw }

/**
 * @example
 * splitNormalQueue('1 + 2') //=> ['1', '+', '2']
 * splitNormalQueue('1+  2.255') //=> ['1', '+', '2.255']
 * splitNormalQueue('1-2.255') //=> ['1', '-', '2.255']
 * splitNormalQueue('1+(-2.2)') //=> ['1', '+', '-2.2']
 * splitNormalQueue('1*(-2.2)') //=> ['1', '*', '-2.2']
 * splitNormalQueue('-1*2.2') //=> ['-1', '*', '2.2']
 */
function splitNormalQueue(exp: string) {
  return exp
    .replaceAll(' ', '')
    .split(/((?<!(?:^|\())\+|(?<!(?:^|\())-|\*|\/|\(|\))/)
    .filter(Boolean)
}

/**
 * @example
 * toRPN('1 + 2') //=> ['1', '2', '+']
 */
function toRPN(exp: string): RPNQueue {
  const input = splitNormalQueue(exp)
  const operatorStack = [] as string[]
  const rpn = [] as RPNQueue

  for (const i of input) {
    switch (i) {
      case '(': {
        operatorStack.push(i)
        break
      }
      case ')': {
        let operator = operatorStack.pop()
        while (operator != '(' && operatorStack.length > 0) {
          rpn.push({ isOperator: true, value: operator as '+' | '-' | '*' | '/' })
          operator = operatorStack.pop()
        }
        if (operator != '(') {
          throw 'error: unmatched ()'
        }
        break
      }
      case '+':
      case '-':
      case '*':
      case '/': {
        while (operatorStack.length > 0 && isChar1PrioratyHigher(i, operatorStack[operatorStack.length - 1])) {
          rpn.push({ isOperator: true, value: operatorStack.pop() as '+' | '-' | '*' | '/' })
        }
        operatorStack.push(i)
        break
      }

      default: {
        rpn.push({ isOperator: false, value: i })
      }
    }
  }

  if (operatorStack.length > 0) {
    if (operatorStack.includes(')') || operatorStack.includes('(')) {
      throw 'error: unmatched ()'
    }
    while (operatorStack.length > 0) {
      rpn.push({ isOperator: true, value: operatorStack.pop() as '+' | '-' | '*' | '/' })
    }
  }

  return rpn
}

console.time('sdf')
// console.log(toRPN('1 + 2'))
// console.log(toRPN('1 + 2 + 3'))
// console.log(toRPN('1 + 2 * 3'))
// console.log(toRPN('1 + 2 * 3 - 4 / 5'))
// console.log(toRPN('( 1 + 2 )'))
// console.log(toRPN('( 1 + 2 ) * ( 3 - 4 ) / 5'))
console.log(toRPN('1*(-3)'))
console.timeEnd('sdf')

function parseRPN(rpn: RPNQueue): NumberishAtom {
  const numberishStack = [] as NumberishAtom[]
  for (const item of rpn) {
    if (item.isOperator) {
      const num2 = numberishStack.pop()
      const num1 = numberishStack.pop()
      if (num1 == undefined || num2 == undefined) {
        throw 'error: invalid rpn'
      }
      switch (item.value) {
        case '+': {
          numberishStack.push(add(num1, num2))
          break
        }
        case '-': {
          numberishStack.push(minus(num1, num2))
          break
        }
        case '*': {
          numberishStack.push(mul(num1, num2))
          break
        }
        case '/': {
          numberishStack.push(div(num1, num2))
          break
        }
      }
    } else {
      numberishStack.push(toNumberishAtom(item.value))
    }
  }
  if (numberishStack.length > 1) {
    throw 'error: invalid rpn'
  }
  return numberishStack[0]
}

function toExpression(n: Numberish) {
  if (isNumberishAtom(n) || isNumberishAtomRaw(n)) {
    return n.numerator + '/' + n.denominator
  } else {
    return String(n)
  }
}

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
function prettifyNumberishAtomWithDecimal(n: NumberishAtomRaw): { numerator: bigint; denominator: bigint } {
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

function prettifyNumberishAtom(n: NumberishAtomRaw): NumberishAtom {
  //@ts-expect-error Temp for DEV
  return prettifyNumberishAtomWith10(prettifyNumberishAtomWithDecimal(n))
}
console.log(prettifyNumberishAtom({ numerator: 10n, denominator: 133n, decimal: 2 }))
console.log(prettifyNumberishAtom({ numerator: 100n, denominator: 133000n, decimal: 1 }))

console.log(prettifyNumberishAtom({ numerator: 10n, denominator: 13300n, decimal: -2 }))
console.log(prettifyNumberishAtom({ numerator: 100n, denominator: 133n, decimal: -1 }))
console.log(toExpression(parseRPN(toRPN('1*(-302)/2'))))
