import { flatMap } from '../'
import {
  flatMapEntries,
  mapEntry
} from './'
import {
  toEntries,
  toEntry
} from './entries'
import { map } from './map'

test('flatMapEntries() only for object and map', () => {
  expect(mapEntry({ a: 1, b: 2 }, (value, key) => toEntry(value + 2, key + 'c'))).toEqual({
    ac: 3,
    bc: 4
  })
})
test('flatMapEntries() only for object and map', () => {
  const a = flatMapEntries({ a: 1, b: 2 }, (value, key) =>
    toEntries({ [key + 'c']: value + 2, [key + 'a']: value * value * 2 })
  )
  expect(a).toEqual({
    ac: 3,
    aa: 2,
    bc: 4,
    ba: 8
  })
})

test('map', () => {
  const t1 = map([1, 2], (v) => v + 1)
  expect(t1).toEqual([2, 3])

  const t2 = map({ a: 1, b: 2 }, (v) => v + 1)
  expect(t2).toEqual({ a: 2, b: 3 })

  const t3 = map({ a: 1, b: 2 }, (v, k) => toEntry(v + 1, k + 'c'))
  expect(t3).toEqual({ ac: 2, bc: 3 })

  const t4 = map(new Set(['6', '7']), (v) => v + 1)
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
test('flatMap', () => {
  const t1 = flatMap([1, 2], (v) => [v + 1, v * v])
  expect(t1).toEqual([2, 1, 3, 4])

  // const t2 = map({ a: 1, b: 2 }, (v) => v + 1)
  // expect(t2).toEqual({ a: 2, b: 3 })

  // const t3 = map({ a: 1, b: 2 }, (v, k) => [k + 'c', v + 1])
  // expect(t3).toEqual({ ac: 2, bc: 3 })
})

type T1 = Map<string, number> extends ReadonlySet<any> ? true : false