import { toKeyValueEntry } from './entries'
import {
  insertAfter,
  insertBefore
} from './insert'

test('insertBefore()', () => {
  // accept array
  const nArr = insertBefore([1, 2, 3, 4], (v) => v >= 2, 6)
  expect(nArr).toEqual([1, 6, 2, 3, 4])

  // accept object
  const a = insertBefore(
    { hello: 1, world: 2, hi: 'hello world' },
    (v) => v >= 2,
    toKeyValueEntry(3, 'hh')
  )
  expect(a).toEqual({ hello: 1, hh: 3, world: 2, hi: 'hello world' })

  // can specified { isEntry: true } is needed
  const bArr = insertBefore([1, 2, 3, 4], (v) => v >= 2, [4, 5])
  expect(bArr).toEqual([1, [4, 5], 2, 3, 4])
})
test('insertAfter()', () => {
  // accept array
  const aArr = insertAfter([1, 2, 3, 4] as const, (v) => v >= 2, 6)
  expect(aArr).toEqual([1, 2, 6, 3, 4])

  // accept object
  const aObj = insertAfter(
    { hello: 1, world: 2, hi: 'hello world' },
    (v) => v >= 2 /*  */,
    toKeyValueEntry(3, 'hh')
  )
  expect(aObj).toEqual({ hello: 1, world: 2, hh: 3, hi: 'hello world' })

  // can specified { isEntry: true } is needed
  const bArr = insertAfter([1, 2, 3, 4], (v) => v >= 2, [4, 5])
  expect(bArr).toEqual([1, 2, [4, 5], 3, 4])
})
