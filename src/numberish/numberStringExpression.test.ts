import { fromNumberishtoExpressionString, parseRPNToNumberish, splitNumberExpression, toRPN } from './numberExpression'

test('numberish: expression', () => {
  expect(parseRPNToNumberish(toRPN('1*(-302)/2'))).toEqual({ 'numerator': -302n, denominator: 2n, decimal: 0 })
  expect(parseRPNToNumberish(toRPN('-1 * ( -302 / 2 )'))).toEqual({ 'numerator': 302n, denominator: 2n, decimal: 0 })
  expect(splitNumberExpression('1+(-2.2)')).toEqual(['1', '+', '-2.2']) //=> ['1', '+', '-2.2']
})
