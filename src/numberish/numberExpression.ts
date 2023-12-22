import { switchCase } from '../switchCase'
import { NumberishAtom, NumberishAtomRaw } from '../typings'
import { toNumberishAtom } from './numberishAtom'
import { add, div, minus, mul } from './operations'

type Operator = '+' | '-' | '*' | '/' | '^' | (string & {})
type NumberToken = string
type Priority = number
const operators: Record<Operator, Priority> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3
}

/**
 * @see https://zh.wikipedia.org/wiki/%E9%80%86%E6%B3%A2%E5%85%B0%E8%A1%A8%E7%A4%BA%E6%B3%95
 */
type RPNQueue = RPNItem[]

type RPNItem =
  | { isOperator: true; value: Operator }
  | { isOperator: false; value: number | NumberToken | bigint | NumberishAtomRaw }

/**
 * @example
 * splitNormalQueue('1 + 2') //=> ['1', '+', '2']
 * splitNormalQueue('1+  2.255') //=> ['1', '+', '2.255']
 * splitNormalQueue('1-2.255') //=> ['1', '-', '2.255']
 * splitNormalQueue('1+(-2.2)') //=> ['1', '+', '-2.2']
 * splitNormalQueue('1*(-2.2)') //=> ['1', '*', '-2.2']
 * splitNormalQueue('-1*2.2') //=> ['-1', '*', '2.2']
 */
export function splitNumberExpression(exp: string) {
  return exp
    .replace(/\s+/g, '')
    .split(/((?<!(?:^|\())\+|(?<!(?:^|\())-|\*|\/|\(|\))/) // to complicated
    .filter(Boolean)
}

export function parseRPNToNumberishAtom(rpn: RPNQueue): NumberishAtom {
  const rpnLengthIsValid = rpn.length % 2 === 1
  if (!rpnLengthIsValid) {
    throw `invalid rpn length, so can't parse`
  }

  const numberishStack = [] as NumberishAtom[]
  for (const item of rpn) {
    if (item.isOperator) {
      const num2 = numberishStack.pop()
      const num1 = numberishStack.pop()
      if (num1 == undefined || num2 == undefined) {
        throw `invalid rpn, can't parse`
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
        case '^': {
          numberishStack.push(mul(num1, num2))
          break
        }
      }
    } else {
      numberishStack.push(toNumberishAtom(item.value))
    }
  }
  if (numberishStack.length !== 1) {
    throw 'error: invalid rpn'
  }
  const resultN = numberishStack[0]
  return resultN
}

export function toRPN(expression: string): RPNQueue {
  const operatorStack: string[] = []
  const rpnQueue: RPNQueue = []
  function recordToRPNQueue(value: string | undefined, options?: { isOperator?: boolean; onAfterPush?(): void }) {
    if (value) {
      rpnQueue.push({ isOperator: Boolean(options?.isOperator), value: value })
      options?.onAfterPush?.()
    }
  }
  let currentToken = ''
  const recordNumberTokenToRPNQueue = () =>
    recordToRPNQueue(currentToken, { isOperator: false, onAfterPush: () => (currentToken = '') })
  const recordLastOperatorToRPNQueue = () =>
    operatorStack.length > 0 && recordToRPNQueue(operatorStack.pop()!, { isOperator: true })
  const charIsNumberToken = (char: string) => /\d|\./.test(char)
  const handleNumberToken = (char: string) => (currentToken += char)
  const charIsSpace = (char: string) => /\s/.test(char)
  const handleSpace = (char: string) => recordNumberTokenToRPNQueue()
  const charIsOperator = (char: string) => {
    const isKnownOperator = operators.hasOwnProperty(char)
    return isKnownOperator
  }
  const handleOperator = (char: string) => {
    recordNumberTokenToRPNQueue()
    while (operatorStack.length > 0 && operators[operatorStack[operatorStack.length - 1]] >= operators[char]) {
      recordLastOperatorToRPNQueue()
    }
    operatorStack.push(char)
  }

  const charIsLeftParenthesis = (char: string) => char === '('
  const handleLeftParenthesis = (char: string) => operatorStack.push(char)

  const charIsRightParenthesis = (char: string) => char === ')'
  const handleRightParenthesis = (char: string) => {
    while (operatorStack[operatorStack.length - 1] !== '(') {
      recordLastOperatorToRPNQueue()
    }
    // now the top of the stack is '('
    operatorStack.pop()
  }

  for (const char of expression) {
    switchCase(char, [
      [charIsNumberToken, handleNumberToken],
      [charIsSpace, handleSpace],
      [charIsOperator, handleOperator],
      [charIsLeftParenthesis, handleLeftParenthesis],
      [charIsRightParenthesis, handleRightParenthesis]
    ])
  }

  recordNumberTokenToRPNQueue() // 将最后一个数字添加到输出队列中

  // 将栈中剩余的操作符弹出并添加到输出队列中
  while (operatorStack.length > 0) {
    recordLastOperatorToRPNQueue()
  }

  return rpnQueue // 返回逆波兰表示法的数组形式
}
