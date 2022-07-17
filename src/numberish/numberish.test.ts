import { toString } from './changeFormat'
import { add, minus, multiply } from './operations'

test('toString', () => {
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
