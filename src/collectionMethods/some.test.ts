import { some } from './'

test('some ', () => {
  const t1 = some([1, 2], (v) => v > 1)
  const t2 = some(new Set([1, 2]), (v) => v > 1)
  const t3 = some({ a: 'hello', b: 'world' }, (v) => v === 'hello')
  const t4 = some(
    new Map([
      ['a', 1],
      ['b', 2]
    ]),
    (v) => v >= 1
  )
  expect(t1).toEqual(true)
  expect(t2).toEqual(true)
  expect(t3).toEqual(true)
  expect(t4).toEqual(true)
})
