import { Numberish } from './types'
import { toStringNumber } from './numberishAtom'

/**
 * like Number.toFixed, but can use for all Numberish
 * @example
 * roFixedDecimal(100.2, 3) // result: '100.200'
 * toFixedDecimal(100.22833, 2) // result: '100.23'
 * toFixedDecimal(100.22833, 2, 'up') // result: '100.23'
 * toFixedDecimal(100.22833, 2, 'down') // result: '100.22'
 */
export function toFixedDecimal(n: Numberish, decimals: number, roundMode: 'up' | 'down' | 'round' = 'round'): string {
  const sn = toStringNumber(n)
  const [, sign = '', int = '', dec = ''] = sn.match(/(-?)(\d*)\.?(\d*)/) ?? []
  if (!dec) return decimals > 0 ? `${sign}${int}.${'0'.repeat(decimals)}` : `${sign}${int}`
  if (dec.length <= decimals) return `${sign}${int}.${dec.padEnd(decimals, '0')}`
  if (dec.length > decimals) {
    // TODO_Slow: currently, donot support negative n
    // like Math.round/ceil/floor
    if (roundMode === 'down') return `${sign}${int}.${dec.slice(0, decimals)}`
    const lastOneRight = dec[decimals] ?? '0'
    if (lastOneRight === '0') return `${sign}${int}.${dec.slice(0, decimals)}`

    if (roundMode === 'up' || (roundMode === 'round' && lastOneRight >= '5')) {
      const newDecimals = Array.from(dec.slice(0, decimals)).map((d) => Number(d))
      for (let i = newDecimals.length - 1; i >= 0; i--) {
        if (newDecimals[i] === 9) {
          newDecimals[i] = 0
        } else {
          newDecimals[i]++
          return `${sign}${int}.${newDecimals.join('')}`
        }
      }
      const newInt = Array.from(int).map((d) => Number(d))
      for (let i = newInt.length - 1; i >= 0; i--) {
        if (newInt[i] === 9) {
          newInt[i] = 0
        } else {
          newInt[i]++
          return `${sign}${newInt.join('')}.${'0'.repeat(decimals)}`
        }
      }
      newInt.unshift(1)
      return `${sign}${newInt.join('')}.${'0'.repeat(decimals)}`
    }
  }
  return decimals > 0 ? `${sign}${int}.${dec.slice(0, decimals)}` : `${sign}${int}`
}
