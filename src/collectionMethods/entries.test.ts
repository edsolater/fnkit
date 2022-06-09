import {
  toCollection,
  toEntries,
  toEntry
} from './entries'

test(' toEntries() accept any kind of collection (array, object, set, map)', () => {
  expect(toEntries({ a: 1, b: 2 })).toEqual([toEntry(1, 'a'), toEntry(2, 'b')])
  expect(toEntries([1, 2, 3])).toEqual([toEntry(1, 0), toEntry(2, 1), toEntry(3, 2)])
  expect(toEntries(new Set([1, 2, 3]))).toEqual([
    toEntry(1, 0),
    toEntry(2, 1),
    toEntry(3, 2)
  ])
  expect(
    toEntries(
      new Map([
        ['a', 1],
        ['b', 2]
      ])
    )
  ).toEqual([toEntry(1, 'a'), toEntry(2, 'b')])
})

test('fromEntries() accept the return of toEntries() and will transform it to be a type of collection', () => {
  expect(
    toCollection([toEntry(3, 'hello'), toEntry(4, 'hh'), toEntry(5, 'world')], 'Object')
  ).toEqual({ hello: 3, hh: 4, world: 5 })
  expect(toCollection([toEntry(2), toEntry(3)], 'Set')).toEqual(new Set([2, 3]))
})
