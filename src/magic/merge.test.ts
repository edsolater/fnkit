import { merge } from './merge'

test('merge', () => {
  expect(merge([0, 1, 2], ['hello', 'world'])).toEqual([0, 1, 2, 'hello', 'world'])
  expect(merge({ a: 3, b: 2 }, { a: 1, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
  expect(
    merge(
      (n) => 3 + n,
      (n) => 4 * n,
      () => 5
    )(2)
  ).toEqual(((n) => [3 + n, 4 * n, 5])(2))
  expect(merge({ a: ['world'], b: 2, c: 1 }, { a: ['hello'], c: 3 }, { c: [10] })).toEqual({
    a: ['world', 'hello'],
    b: 2,
    c: [10]
  })
})
