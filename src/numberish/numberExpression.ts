import { isObject, isString } from "../dataType"
import { switchCase } from "../switchCase"
import { toFraction } from "./numberishAtom"
import { add, div, minus, mul, pow } from "./operations"
import { Fraction, MathematicalExpression, type BasicNumberish } from "./types"

export type Operator = "+" | "-" | "*" | "/" | "^" | (string & {})
export type Priority = number
const operators: Record<Operator, Priority> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 3,
}

export type RPNItem = { isOperator: true; value: Operator } | { isOperator: false; value: BasicNumberish }

export function isRPNItem(item: unknown): item is RPNItem {
  return isObject(item) && "isOperator" in item
}

export function parseRPNToFraction(rpn: RPNItem[]): Fraction {
  const rpnLengthIsValid = rpn.length % 2 === 1
  if (!rpnLengthIsValid) {
    throw `invalid rpn length, so can't parse`
  }

  const numberishStack: Fraction[] = []
  for (const item of rpn) {
    if (item.isOperator) {
      const num2 = numberishStack.pop()
      const num1 = numberishStack.pop()
      if (num1 == undefined || num2 == undefined) {
        throw `invalid rpn, can't parse`
      }
      switch (item.value) {
        case "+": {
          numberishStack.push(toFraction(add(num1, num2)))
          break
        }
        case "-": {
          numberishStack.push(toFraction(minus(num1, num2)))
          break
        }
        case "*": {
          numberishStack.push(toFraction(mul(num1, num2)))
          break
        }
        case "/": {
          numberishStack.push(toFraction(div(num1, num2)))
          break
        }
        case "^": {
          numberishStack.push(toFraction(pow(num1, num2)))
          break
        }
      }
    } else {
      numberishStack.push(toFraction(item.value))
    }
  }
  if (numberishStack.length !== 1) {
    throw "error: invalid rpn"
  }
  const resultN = numberishStack[0]
  return resultN
}

export function toRPN(expression: MathematicalExpression): RPNItem[] {
  if (isMathematicalExpressionASingleValue(expression) as boolean) {
    return [{ isOperator: false, value: expression }]
  }
  type charLoopParams = { prevChar: string | undefined; char: string; nextChar: string | undefined }
  const operatorStack: string[] = []
  const rpnQueue: RPNItem[] = []

  let currentToken = ""
  const recordNumberTokenToRPNQueue = () =>
    recordToRPNQueue(currentToken, { isOperator: false, onAfterPush: () => (currentToken = "") })
  const recordLastOperatorToRPNQueue = () =>
    operatorStack.length > 0 && recordToRPNQueue(operatorStack.pop()!, { isOperator: true })
  const recordToRPNQueue = (value: string | undefined, options?: { isOperator?: boolean; onAfterPush?(): void }) => {
    if (value) {
      rpnQueue.push({ isOperator: Boolean(options?.isOperator), value: value })
      options?.onAfterPush?.()
    }
  }

  const charIsNumberToken = ({ char, nextChar, prevChar }: charLoopParams) =>
    char === "." ||
    (char >= "0" && char <= "9") ||
    (char === "-" && nextChar != null && /\d/.test(nextChar)) ||
    (prevChar != null && nextChar != null && char === "e")
  const charIsSpace = ({ char }: charLoopParams) => /\s/.test(char)
  const charIsOperator = ({ char }: charLoopParams) => {
    const isKnownOperator = operators.hasOwnProperty(char)
    return isKnownOperator
  }
  const charIsLeftParenthesis = ({ char }: charLoopParams) => char === "("
  const charIsRightParenthesis = ({ char }: charLoopParams) => char === ")"

  const handleNumberToken = ({ char }: charLoopParams) => (currentToken += char)
  const handleSpace = () => recordNumberTokenToRPNQueue()
  const handleOperator = ({ char }: charLoopParams) => {
    recordNumberTokenToRPNQueue()
    while (operatorStack.length > 0 && operators[operatorStack[operatorStack.length - 1]] >= operators[char]) {
      recordLastOperatorToRPNQueue()
    }
    operatorStack.push(char)
  }
  const handleLeftParenthesis = ({ char }: charLoopParams) => operatorStack.push(char)
  const handleRightParenthesis = () => {
    while (operatorStack[operatorStack.length - 1] !== "(") {
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
      [charIsRightParenthesis, handleRightParenthesis],
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

export function isMathematicalExpression(s: any): s is string {
  return isString(s) && !stringNumberRegex.test(s)
}

const stringNumberRegex = /^\s*[+-]?\d+\.?\d*(?:[eE][+-]?\d+)?\s*$/
/**
 *
 * @example
 * isMathematicalExpressionASingleValue('3.1') //=> true
 * isMathematicalExpressionASingleValue('3.1e-2') //=> true
 * isMathematicalExpressionASingleValue('3.1e-2 + 4 * 2 - ( 1 - 5 ) ^ 2 ^ 3') //=> false
 */
export function isMathematicalExpressionASingleValue(s: any): s is string {
  return s && stringNumberRegex.test(s)
}
