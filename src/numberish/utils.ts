import { Numberish } from './types'
import { toStringNumber } from './numberishAtom'

export function toFixedDecimal(n: Numberish, decimals: number): string {
  const sn = toStringNumber(n)
  const [, sign = '', int = '', dec = ''] = sn.match(/(-?)(\d*)\.?(\d*)/) ?? []
  if (!dec) return `${sign}${int}`
  if (dec.length <= decimals) return `${sign}${int}.${dec.padEnd(decimals, '0')}`
  return decimals > 0 ? `${sign}${int}.${dec.slice(0, decimals)}` : `${sign}${int}`
}
