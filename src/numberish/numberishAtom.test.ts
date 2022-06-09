import { equal, greaterThan, greaterThanOrEqual, hasDecimal, isZero, notZero } from './compare'
import { add, divideMod } from './operations'
import { toString } from './changeFormat'

test('numberish compare greaterThan()', () => {
  expect(greaterThan(2, 3)).toEqual(false)
  expect(greaterThan('3', 3)).toEqual(false)
  expect(greaterThan('3.21', 3)).toEqual(true)
  expect(greaterThan('-3.21', 3)).toEqual(false)
  expect(greaterThan('4', 3)).toEqual(true)
})

test('numberish compare greaterThanOrEqual()', () => {
  expect(greaterThanOrEqual(2, 3)).toEqual(false)
  expect(greaterThanOrEqual('3', 3)).toEqual(true)
  expect(greaterThanOrEqual('3.21', 3)).toEqual(true)
})

test('numberish compare equal()', () => {
  expect(equal(2, 3)).toEqual(false)
  expect(equal('3', 3)).toEqual(true)
  expect(equal('3.0', 3)).toEqual(true)
  expect(equal('.3', 3)).toEqual(false)
  expect(equal('-3.0', -3)).toEqual(true)
})
test('numberish operation add()', () => {
  expect(add(2, 3)).toEqual(toString(5))
  expect(add('2', 3)).toEqual(toString(5))
  expect(add('2.2', 3)).toEqual(toString(5.2))
})
test('numberish operation divideMod()', () => {
  expect(divideMod(4, 3)).toEqual(['1', '1'])
  expect(divideMod(-4, 3)).toEqual(['-1', '-1'])
  expect(divideMod(3.2, 1.2)).toEqual(['2', '0.8'])
})
test('numberish toString()', () => {
  expect(toString(3)).toEqual('3')
  expect(toString('.3')).toEqual('0.3')
  expect(toString('8n')).toEqual('8')
  expect(toString(3e2)).toEqual('300')
  expect(toString(3.123e2)).toEqual('312.3')
  expect(toString(3.14e20)).toEqual('314000000000000000000')
  expect(toString('3.123e2')).toEqual('312.3')
  expect(toString({ decimal: -1, all: BigInt('314') })).toEqual('3140')
  expect(toString({ decimal: -40, all: BigInt('314') })).toEqual(
    '3140000000000000000000000000000000000000000'
  )
  expect(toString({ decimal: 2, all: BigInt('42312') })).toEqual('423.12')
  expect(toString({ decimal: 0, all: BigInt('12') })).toEqual('12')
  expect(toString({ decimal: 7, all: BigInt('40000000') })).toEqual('4')
})
test('numberish judge isZero()', () => {
  expect(isZero(0)).toEqual(true)
  expect(isZero('0')).toEqual(true)
  expect(isZero('1')).toEqual(false)
})
test('numberish judge notZero()', () => {
  expect(notZero(1)).toEqual(true)
})
test('numberish judge hasDecimal()', () => {
  expect(hasDecimal(0)).toEqual(false)
  expect(hasDecimal(0.3)).toEqual(true)
  expect(hasDecimal('33.4')).toEqual(true)
  expect(hasDecimal('33')).toEqual(false)
})
