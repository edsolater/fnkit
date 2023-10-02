import { Numberish } from '../typings'

/**
 *
 * @example
 * getIntInfo(0.34) //=> { numerator: '34', denominator: '100'}
 * getIntInfo('0.34') //=> { numerator: '34', denominator: '100'}
 */
export function parseNumberInfo(n: Numberish | undefined): {
  denominator: string
  numerator: string
  sign?: string
  int?: string
  dec?: string
} {
  if (n === undefined) return { denominator: '1', numerator: '0' }
  const s = String(n)
  const [, sign = '', int = '', dec = ''] = s.match(/(-?)(\d*)\.?(\d*)/) ?? []
  const denominator = '1' + '0'.repeat(dec.length)
  const numerator = sign + (int === '0' ? '' : int) + dec || '0'
  return { denominator, numerator, sign, int, dec }
}