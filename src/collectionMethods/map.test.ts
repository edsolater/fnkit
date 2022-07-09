import { toEntry } from './entries'
import { flatMapEntry, map, mapEntry, mapKey } from './map'

test('fnkit: flatMapEntries()', () => {
  const a = flatMapEntry({ a: 1, b: 2 }, (value, key) => [
    { key: key + 'c', value: value + 2 },
    { key: key + 'a', value: value * value * 2 }
  ])
  // const a = flatMapEntries({ a: 1, b: 2 }, (value, key) =>
  //   toEntries({ [key + 'c']: value + 2, [key + 'a']: value * value * 2 })
  // )
  expect(a).toEqual({
    ac: 3,
    aa: 2,
    bc: 4,
    ba: 8
  })
})
// test('fnkit: flatMapEntries()', () => {
//   const a = flatMapEntries({ a: 1, b: 2 }, (value, key) => [
//     { key: [key + 'c'], value: value + 2 },
//     { key: [key + 'a'], value: value * value * 2 }
//   ])
//   // const a = flatMapEntries({ a: 1, b: 2 }, (value, key) =>
//   //   toEntries({ [key + 'c']: value + 2, [key + 'a']: value * value * 2 })
//   // )
//   expect(a).toEqual({
//     ac: 3,
//     aa: 2,
//     bc: 4,
//     ba: 8
//   })
// })

test('fnkit: map()', () => {
  const source = Array.from({ length: 100000 }, (_, idx) => idx + 1)

  console.time('map array original')
  const torignal = source.map((v) => v + 1).reduce((a, b) => a + b)
  const ct = torignal + 1
  console.timeEnd('map array original')

  console.time('map array iterable')
  const t0 = map(source, (v) => v + 1).reduce((a, b) => a + b)
  const c = t0 + 1
  console.timeEnd('map array iterable')

  const t1 = map([1, 2], (v) => v + 1)
  expect(t1).toEqual([2, 3])

  const t2 = map({ a: 1, b: 2 }, (v) => v + 1)
  expect(t2).toEqual({ a: 2, b: 3 })

  const t4 = map(new Set(['6', '7']), (v) => v + '1')
  expect(t4).toEqual(new Set(['61', '71']))

  const t5 = map(
    new Map([
      ['a', 1],
      ['b', 2]
    ]),
    (v) => v + 1
  )
  expect(t5).toEqual(
    new Map([
      ['a', 2],
      ['b', 3]
    ])
  )
})

test('fnkit:mapEntries()', () => {
  const t12 = mapEntry([1, 2], (v) => toEntry(v + 1, 0))
  expect(t12).toEqual([2, 3])
  const t3 = mapEntry({ a: 1, b: 2 }, (v, k) => ({ key: k + 'c', value: v + 1 }))
  expect(t3).toEqual({ ac: 2, bc: 3 })
})

test('fnkit:mapKey()', () => {
  const t3 = mapKey({ a: 1, b: 2 }, (k) => k + 'c')
  expect(t3).toEqual({ ac: 1, bc: 2 })
})
