import groupBy from './groupBy'

test('groupBy ', () => {
  const t1 = groupBy([1, 2, 3, 4, 5], (v) => (v % 2 ? 'odd' : 'even'))
  expect(t1).toEqual({
    odd: [1, 3, 5],
    even: [2, 4]
  })
  const t2 = groupBy({ a: 1, b: 2, c: 3 }, (v) => (v % 2 ? 'odd' : 'even'))
  expect(t2).toEqual({
    odd: {
      a: 1,
      c: 3
    },
    even: { b: 2 }
  })
})
