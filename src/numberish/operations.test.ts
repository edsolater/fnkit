import { toString } from './numberishAtom'
import { add, minus, multiply, pow } from './operations'

test('numberish: toString', () => {
  expect(toString(3.22)).toBe('3.22')
  expect(toString({ numerator: 12312n, decimal: 4 })).toBe('1.2312')
})

test('numberish: operator', () => {
  expect(toString(add('9007199254740991.4', '112.4988'))).toBe('9007199254741103.8988')

  expect(toString(minus('1.22', '112.3'))).toBe('-111.08')
  expect(toString(minus('1.22', '-112.3'))).toBe('113.52')
  expect(toString(minus('9007199254740991.4', '112.4988'))).toBe('9007199254740878.9012')

  expect(toString(multiply('1.22', '112.3'))).toBe('137.006')
  expect(toString(multiply('9007199254740991.4', '112.4988'))).toBe('1013299107519255843.31032')
})
test('pow: (2 ^ 3 = 8)', () => {
  expect(toString(pow('2', '3'))).toBe('8')
  // expect(toString(pow(2n, '3'))).toBe('8')
  // expect(toString(pow('2', '3.1')).startsWith('8.57418')).toBe(true)
})
