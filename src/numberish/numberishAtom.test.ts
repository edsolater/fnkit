import { toNumberishAtom, toString } from './numberishAtom'

test('numberish: create from expression', () => {
  expect(toString(toNumberishAtom('3/2'))).toBe('1.5')
})
test('numberish: toString', () => {
  expect(toString('0.3')).toBe('0.3')
  expect(toString(8n)).toBe('8')
})
