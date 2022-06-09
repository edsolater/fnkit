import { Numberish, NumberishAtom } from '../typings'
import { toNumberishAtom } from './numberishAtom'
import { padZeroR, shakeTailingZero } from './utils'

/**
 * @example
 * toString(3) //=> '3'
 * toString('.3') //=> '0.3'
 * toString('8n') //=> '8'
 * toString({ decimal: 2, all: '42312' }) => '423.12'
 * toString({ decimal: 0, all: '12' }) //=> '12'
 * toString({ decimal: 7, all: '40000000' }) //=> '4'
 */
export function toString(from: Numberish): string {
  const { decimal, all } = toNumberishAtom(from)
  if (decimal === 0) return String(all)
  if (decimal < 0) return padZeroR(String(all), -decimal)
  return shakeTailingZero(
    [
      String(all).slice(0, -decimal) || '0',
      '.',
      String(all).padStart(decimal, '0').slice(-decimal)
    ].join('')
  )
}
/**
 * CAUTION : if original number have decimal part, it will lost
 */
export function toBigint(from: Numberish | NumberishAtom): bigint {
  const { decimal, all } = toNumberishAtom(from)
  if (decimal === 0) return all
  if (decimal < 0) return BigInt(padZeroR(String(all), -decimal))
  return BigInt(String(all).slice(0, -decimal) || '0')
}

/**
 * CAUTION 1: if original number have very long decimal part, it will lost
 * CAUTION 2: result MUST between MAX_SAFE_INTEGER and MIN_SAFE_INTEGER
 *
 */
export function toNumber(from: Numberish | NumberishAtom): number {
  const { decimal, all } = toNumberishAtom(from)
  if (decimal === 0) {
    if (all > Number.MAX_SAFE_INTEGER) {
      console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
      return Number.MAX_SAFE_INTEGER
    }
    if (all < Number.MIN_SAFE_INTEGER) {
      console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
      return Number.MIN_SAFE_INTEGER
    }
    return Number(all)
  }

  if (decimal < 0) {
    const n = Number(padZeroR(String(all), -decimal))
    if (n > Number.MAX_SAFE_INTEGER) {
      console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
      return Number.MAX_SAFE_INTEGER
    }
    if (n < Number.MIN_SAFE_INTEGER) {
      console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
      return Number.MIN_SAFE_INTEGER
    }
    return n
  }

  const n = Number(String(all).slice(0, -decimal) || '0')
  if (n > Number.MAX_SAFE_INTEGER) {
    console.error('toNumber error, bigger than MAX_SAFE_INTEGER')
    return Number.MAX_SAFE_INTEGER
  }
  if (n < Number.MIN_SAFE_INTEGER) {
    console.error('toNumber error, smaller than MIN_SAFE_INTEGER')
    return Number.MIN_SAFE_INTEGER
  }
  return n
}
