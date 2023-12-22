import { toRPN } from './numberExpression'

test('numberExpression', () => {
  const expression = '3.1 + 4 * 2 - ( 1 - 5 ) ^ 2 ^ 3'
  const rpn = toRPN(expression)
  expect(rpn.map((i) => i.value)).toEqual(['3.1', '4', '2', '*', '+', '1', '5', '-', '2', '^', '3', '^', '-'])
})
