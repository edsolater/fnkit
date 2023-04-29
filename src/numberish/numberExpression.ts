import { Numberish } from '../typings'

type Expression = string

function shrinkExpression(expression: Expression): Expression {
  return expression
}

/**
 * @example
 * '1.22 + 112.3' //=> '113.52'
 * '112.3 * 2.2' //=> '246.06'
 * '1+1/3' //=> '4/3'
 */
function shrinkExpressionOfOneOperation(expression: Expression): Expression {
  return expression
}

/**
 * @example
 * '1.22 + 112.3 * 2.2 + (1/3)' //=> false
 * '1/3' //=> true
 * '(1/3)' //=> false
 * '1/3 + 1/3' //=> false
 * '11.2' => false
 * '11' => true
 */
function isEndExpression(expression: Expression): boolean {
  return /^\d+$/.test(expression) || /^\d+\/\d+$/.test(expression)
}

const verbosExpression = '1.22 + 112.3 * 2.2 + (1/3)'
const result = 1.22 + 112.3 * 2.2 + 1 / 3
result
const shrinkedExpression = shrinkExpression(verbosExpression)
shrinkedExpression
console.log(isEndExpression('11'))
console.log(isEndExpression('1/3'))
console.log(isEndExpression('1/3 + 1/3'))
console.log(isEndExpression('1/3 + 1/3 + 1/3'))
