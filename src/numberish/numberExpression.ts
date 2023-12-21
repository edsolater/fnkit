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
export function splitFromNormalString(exp: string) {
  return exp
    .replace(/\s+/g, '')
    .split(/((?<!(?:^|\())\+|(?<!(?:^|\())-|\*|\/|\(|\))/)
    .filter(Boolean)
}

// /**
//  * @example
//  * toRPN('1 + 2') //=> [{isOperator: false, value: '1'}, {isOperator: false, value: '2'}, {isOperator: true, value: '+'}]
//  */
// // TODO: math priority system .e.g. toRPN('4 * 2 ** 5')
// export function toRPN(exp: string): RPNQueue {
//   const input = splitFromNormalString(exp)
//   const operatorStack = [] as string[]
//   const rpn = [] as RPNQueue

//   for (const i of input) {
//     switch (i) {
//       case '(': {
//         operatorStack.push(i)
//         break
//       }
//       case ')': {
//         let operator = operatorStack.pop()
//         while (operator != '(' && operatorStack.length > 0) {
//           rpn.push({ isOperator: true, value: operator as '+' | '-' | '*' | '/' })
//           operator = operatorStack.pop()
//         }
//         if (operator != '(') {
//           throw 'error: unmatched ()'
//         }
//         break
//       }
//       case '+':
//       case '-':
//       case '*':
//       case '/': {
//         while (operatorStack.length > 0 && isChar1PrioratyHigher(i, operatorStack[operatorStack.length - 1])) {
//           rpn.push({ isOperator: true, value: operatorStack.pop() as '+' | '-' | '*' | '/' })
//         }
//         operatorStack.push(i)
//         break
//       }

//       default: {
//         rpn.push({ isOperator: false, value: i })
//       }
//     }
//   }

//   if (operatorStack.length > 0) {
//     if (operatorStack.includes(')') || operatorStack.includes('(')) {
//       throw 'error: unmatched (), there still be an isolated `(` or `)`'
//     }
//     while (operatorStack.length > 0) {
//       rpn.push({ isOperator: true, value: operatorStack.pop() as '+' | '-' | '*' | '/' })
//     }
//   }

//   return rpn
// }

export function parseRPNToNumberish(rpn: RPNQueue): NumberishAtom {
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
  const resultN = numberishStack[0]
  return resultN
}

export function fromRPNtoExpressionString(RPN: RPNQueue): string {
  return RPN.map((item) => (item.isOperator ? item.value : fromNumberishtoExpressionString(item.value))).join(' ')
}

export function fromNumberishtoExpressionString(n: Numberish): string {
  if (isNumberishAtom(n) || isNumberishAtomRaw(n)) {
    return n.numerator + '/' + n.denominator
  } else {
    return String(n)
  }
}

/** 💩: still wrong */
export function toRPN(expression: string): string[] {
  const operators = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
  }

  const stack: string[] = []
  const output: string[] = []
  let currentToken = ''

  for (const char of expression) {
    const charIsPartOfNumber = /\d/.test(char)
    if (charIsPartOfNumber) {
      currentToken += char
    } else if (/\s/.test(char)) {
      // 如果是空格字符，则检查当前令牌是否为有效数字，并将其添加到输出队列中
      if (currentToken !== '') {
        output.push(currentToken)
        currentToken = ''
      }
    } else if (operators.hasOwnProperty(char)) {
      // 如果是操作符，则将其与栈顶操作符进行比较，直到栈顶操作符的优先级低于或等于当前操作符的优先级为止
      while (stack.length > 0 && operators[stack[stack.length - 1]] >= operators[char]) {
        output.push(stack.pop()!) // 使用非空断言，因为栈中至少有一个元素
      }
      stack.push(char) // 将当前操作符压入栈中
    } else if (char === '(') {
      // 如果是左括号，则将其压入栈中
      stack.push(char)
    } else if (char === ')') {
      // 如果是右括号，则将栈顶操作符弹出并添加到输出队列中，直到遇到左括号为止
      while (stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!) // 使用非空断言，因为栈中至少有一个元素
      }
      stack.pop() // 弹出左括号，但不将其添加到输出队列中
    }
  }

  // 将栈中剩余的操作符弹出并添加到输出队列中
  while (stack.length > 0) {
    output.push(stack.pop()!) // 使用非空断言，因为栈中至少有一个元素
  }

  return output // 返回逆波兰表示法的数组形式
}
