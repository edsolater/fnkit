// import {} from 'nod'
test('reduce ', () => {
  const tEmpty = reduce([], (acc, i) => acc + i, 0)
  const t0 = reduce([1], (acc, i) => acc + i, 0)
  const t1 = reduce([1, 2], (acc, i) => acc + i, 0)
  const t2 = reduce(new Set([1, 2]), (acc, i) => acc + i, 0)
  const t3 = reduce(
    new Map([
      ['a', 1],
      ['b', 2]
    ]),
    (acc, i) => acc + i,
    0
  )
  const t4 = reduce({ a: 1, b: 2 }, (acc, i) => acc + i, 0)

  expect(tEmpty).toEqual(0)
  expect(t0).toEqual(1)
  expect(t1).toEqual(3)
  expect(t2).toEqual(3)
  expect(t3).toEqual(3)
  expect(t4).toEqual(3)
})
