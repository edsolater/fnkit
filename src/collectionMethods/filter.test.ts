import { filter } from './'

test('filter ', () => {
  const t1 = filter([1, 2], (v) => v > 2)
  expect(t1).toEqual([])
  const t2 = filter([1, 2], (v) => v >= 2)
  expect(t2).toEqual([2])
  const t3 = filter({ a: 2, b: 3 }, (v) => v >= 3)
  expect(t3).toEqual({ b: 3 })
  const t4 = filter(new Set([4, 5]), (v) => v >= 4)
  expect(t4).toEqual(new Set([4, 5]))
  const t5 = filter(
    new Map([
      ['a', 1],
      ['b', 2]
    ]),
    (v) => v >= 2
  )
  expect(t5).toEqual(new Map([['b', 2]]))
})
