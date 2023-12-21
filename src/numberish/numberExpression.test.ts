import { toRPN } from './numberExpression'

test('numberExpression', () => {
  const expression = '3 + 4 * 2 - ( 1 - 5 ) ^ 2 ^ 3'
  const rpn = toRPN(expression)
  expect(rpn).toEqual(['3', '4', '2', '*', '+', '1', '5', '-', '2', '3', '^', '^', '-'])
})
