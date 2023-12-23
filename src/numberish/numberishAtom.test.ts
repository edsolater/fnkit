import { toNumberishAtom, toString } from './numberishAtom'

test('numberish: create from expression', () => {
  expect(toString(toNumberishAtom('3/2'))).toBe('1.5')
})
