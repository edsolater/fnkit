import { parseRPNToNumberishAtom, toRPN } from './numberExpression'
import { toString } from './numberishAtom'

test('numberExpression', () => {
  const expression = '3.1 + 4 * 2 - ( 1 - 5 ) ^ 2 ^ 3'
  const rpn = toRPN(expression)
  expect(rpn.map((i) => i.value)).toEqual(['3.1', '4', '2', '*', '+', '1', '5', '-', '2', '^', '3', '^', '-'])
})
test('single number is just a special case of expression, single number is shortest expression ', () => {
  expect(toRPN('3.1')[0].value).toEqual('3.1')
  expect(toString(parseRPNToNumberishAtom(toRPN('3.1')))).toEqual('3.1')
})
