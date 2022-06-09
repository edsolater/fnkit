import every from './every'

test('every ', () => {
  const t1 = every([1, 2], (v) => v > 1)
  const t2 = every(new Set([1, 2]), (v) => v > 1)
  const t3 = every({ a: 'hello', b: 'world' }, (v) => v === 'hello')
  const t4 = every(
    new Map([
      ['a', 1],
      ['b', 2]
    ]),
    (v) => v >= 1
  )
  expect(t1).toEqual(false)
  expect(t2).toEqual(false)
  expect(t3).toEqual(false)
  expect(t4).toEqual(true)
})
