import { toFormattedNumber } from './toFormattedNumber'

test('toFormattedNumber', () => {
  const n = 1.5120000000000003e-7
  expect(toFormattedNumber(n)).toEqual('0.00')
  expect(toFormattedNumber(n, { decimals: 9 })).toEqual('0.000000151')
  expect(toFormattedNumber(n, { decimals: 12 })).toEqual('0.000000151200')
})
