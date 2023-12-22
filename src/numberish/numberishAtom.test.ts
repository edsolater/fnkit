import { toNumberishAtom } from './numberishAtom'

test('numberish: create from expression', () => {
  expect(toNumberishAtom('3/2')).toBe({ numerator: 3n, decimal: 0, denominator: 2n })
})
