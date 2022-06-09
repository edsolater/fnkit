import { concat } from './concat'

test('concat()', () => {
  expect(concat([1, 2, 3], ['hello', 'world'])).toEqual([1, 2, 3, 'hello', 'world'])
  expect(concat({ a: 1, b: 3 }, { hello: 'world' })).toEqual({ a: 1, b: 3, hello: 'world' })
})
