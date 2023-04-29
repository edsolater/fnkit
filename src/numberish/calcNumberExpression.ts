/**
 * @see https://m.xp.cn/b.php/107696.html
 */

import { NumberishAtomRaw } from '../typings'
import { toNumberishAtom, toNumberishAtomRaw } from './numberishAtom'
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

type RPNItem = { isOperator: true; value: '+' | '-' | '*' | '/' } | { isOperator: false; value: NumberishAtomRaw }

/**
 * @example
 * toRPN('1 + 2') //=> ['1', '2', '+']
 */
function toRPN(exp: string): RPNQueue {
  const operatorStack = [] as string[]
  const rpn = [] as RPNQueue

  for (const char of exp.replaceAll(' ', '')) {
    switch (char) {
      case '(': {
        operatorStack.push(char)
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
        while (operatorStack.length > 0 && isChar1PrioratyHigher(char, operatorStack[operatorStack.length - 1])) {
          rpn.push({ isOperator: true, value: operatorStack.pop() as '+' | '-' | '*' | '/' })
        }
        operatorStack.push(char)
        break
      }

      default: {
        rpn.push({ isOperator: false, value: toNumberishAtomRaw(char) })
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
console.log(toRPN('1 + 2'))
console.log(toRPN('1 + 2 + 3'))
console.log(toRPN('1 + 2 * 3'))
console.log(toRPN('1 + 2 * 3 - 4 / 5'))
console.log(toRPN('( 1 + 2 )'))
console.log(toRPN('( 1 + 2 ) * ( 3 - 4 ) / 5'))
console.log(toRPN('( 1 + 2 ) * (( 3 - 4 ) *3*       4 /  5)'))
console.timeEnd('sdf')


function parseRPN(rpn: RPNQueue): NumberishAtomRaw {
  const numberishStack = [] as NumberishAtomRaw[]
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
      numberishStack.push(item.value)
    }
  }
  if (numberishStack.length > 1) {
    throw 'error: invalid rpn'
  }
  return numberishStack[0]
}

console.log(parseRPN(toRPN('( 1 + 2 ) * (( 3 - 4 ) *3*4 /     5)')))
