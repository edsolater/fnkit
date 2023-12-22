import { isInt, isPositive, isZero } from './selfIs'

test('basic', () => {
  expect(isZero(0)).toBe(true)
  expect(isZero('0')).toBe(true)
  expect(isZero('0.0')).toBe(true)
  expect(isZero(1)).toBe(false)
  expect(isPositive('1')).toBe(true)
  expect(isPositive('0')).toBe(false)
  expect(isPositive('-1')).toBe(false)
  expect(isInt('-0')).toBe(true)
  expect(isInt('0')).toBe(true)
  expect(isInt('0.0')).toBe(true)
  expect(isInt('0.1')).toBe(false)
})

