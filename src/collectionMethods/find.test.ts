import { findEntry } from './'
import {
  find,
  findKey
} from './find'

test('find value', () => {
  expect(find([1, 2], (v) => v > 2)).toEqual(undefined)
  expect(find([1, 2], (v) => v >= 2)).toEqual(2)
  expect(find({ a: 2, b: 3 }, (v) => v >= 3)).toEqual(3)
  expect(find(new Set([4, 5]), (v) => v >= 4)).toEqual(4)
  expect(
    find(
      new Map([
        ['a', 1],
        ['b', 2]
      ]),
      (v) => v >= 2
    )
  ).toEqual(2)
})
test('find key', () => {
  expect(findKey([1, 2], (v) => v > 2)).toEqual(undefined)
  expect(findKey([1, 2], (v) => v >= 2)).toEqual(1)
  expect(findKey({ a: 2, b: 3 }, (v) => v >= 3)).toEqual('b')
  expect(findKey(new Set([4, 5]), (v) => v >= 4)).toEqual(0)
  expect(
    findKey(
      new Map([
        ['a', 1],
        ['b', 2]
      ]),
      (v) => v >= 2
    )
  ).toEqual('b')
})
test('find entry', () => {
  expect(findEntry([1, 2], (v) => v > 2)).toEqual(undefined)
  expect(findEntry([1, 2], (v) => v >= 2)).toEqual([1, 2])
  expect(findEntry({ a: 2, b: 3 }, (v) => v >= 3)).toEqual(['b', 3])
  expect(findEntry(new Set([4, 5]), (v) => v >= 4)).toEqual([0, 4])
  expect(
    findEntry(
      new Map([
        ['a', 1],
        ['b', 2]
      ]),
      (v) => v >= 2
    )
  ).toEqual(['b', 2])
})
