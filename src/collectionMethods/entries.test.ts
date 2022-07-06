import { toEntry } from './entries'

test('fnkit:entries', () => {
  const e = toEntry('hello', 2)
  expect(e).toEqual({ key: 2, value: 'hello' })
})
