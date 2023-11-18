import { switchCase } from './switchCase'

test(`${switchCase}() basic usage`, () => {
  const a1 = switchCase('a', { a: 1 })
  expect(a1).toBe(1)
})
