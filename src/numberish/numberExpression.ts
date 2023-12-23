import { isString } from '../dataType'
import { switchCase } from '../switchCase'
import { MathExpression, NumberishAtom, NumberishAtomRaw } from '../typings'
import { toNumberishAtom, toNumberishAtomRaw } from './numberishAtom'
import { add, div, minus, mul, pow } from './operations'

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

export function parseRPNToNumberishAtom(rpn: RPNQueue): NumberishAtom {
  const rpnLengthIsValid = rpn.length % 2 === 1
  if (!rpnLengthIsValid) {
    throw `invalid rpn length, so can't parse`
  }

  const numberishStack: NumberishAtom[] = []
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
          numberishStack.push(pow(num1, num2))
          break
        }
      }
    } else {
      numberishStack.push(toNumberishAtomRaw(item.value))
    }
  }
  if (numberishStack.length !== 1) {
    throw 'error: invalid rpn'
  }
  const resultN = numberishStack[0]
  return resultN
}

export function toRPN(expression: MathExpression): RPNQueue {
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
  type charLoopParams = { prevChar: string | undefined; char: string; nextChar: string | undefined }
  const charIsNumberToken = ({ char, nextChar }: charLoopParams) =>
    /\d|\./.test(char) || (char === '-' && nextChar != null && /\d/.test(nextChar))
  const handleNumberToken = ({ char }: charLoopParams) => (currentToken += char)
  const charIsSpace = ({ char }: charLoopParams) => /\s/.test(char)
  const handleSpace = () => recordNumberTokenToRPNQueue()
  const charIsOperator = ({ char }: charLoopParams) => {
    const isKnownOperator = operators.hasOwnProperty(char)
    return isKnownOperator
  }
  const handleOperator = ({ char }: charLoopParams) => {
    recordNumberTokenToRPNQueue()
    while (operatorStack.length > 0 && operators[operatorStack[operatorStack.length - 1]] >= operators[char]) {
      recordLastOperatorToRPNQueue()
    }
    operatorStack.push(char)
  }
  const charIsLeftParenthesis = ({ char }: charLoopParams) => char === '('
  const handleLeftParenthesis = ({ char }: charLoopParams) => operatorStack.push(char)
  const charIsRightParenthesis = ({ char }: charLoopParams) => char === ')'
  const handleRightParenthesis = () => {
    while (operatorStack[operatorStack.length - 1] !== '(') {
      recordLastOperatorToRPNQueue()
    }
    // now the top of the stack is '('
    operatorStack.pop()
  }

  for (let i = 0; i < expression.length; i++) {
    const prevChar = expression[i - 1] as string | undefined
    const char = expression[i]
    const nextChar = expression[i + 1] as string | undefined
    switchCase({ prevChar, char, nextChar } as charLoopParams, [
      [charIsNumberToken, handleNumberToken],
      [charIsSpace, handleSpace],
      [charIsOperator, handleOperator],
      [charIsLeftParenthesis, handleLeftParenthesis],
      [charIsRightParenthesis, handleRightParenthesis]
    ])
  }

  // if still have number token, push to rpn queue
  recordNumberTokenToRPNQueue() 

  // push to rpn queue
  while (operatorStack.length > 0) {
    recordLastOperatorToRPNQueue()
  }

  return rpnQueue 
}

export function isNumberishExpression(s: any): s is String {
  return isString(s) && (s.includes('+') || s.includes('-') || s.includes('*') || s.includes('/') || s.includes('^'))
}
