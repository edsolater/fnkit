import { shakeTailingZero } from './trimZero'

test('shakeTailingZero', () => {
  expect(shakeTailingZero('-33.33000000')).toBe('-33.33')
  expect(shakeTailingZero('-33.000000')).toBe('-33')
  expect(shakeTailingZero('.000000')).toBe('0')
})
