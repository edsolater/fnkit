import { Numberish } from './types'
import { parseAnatomyNumberInfo } from './parseAnatomyNumberInfo'

type AnatomyFractionInfo = {
  numerator: bigint
  denominator: bigint
}

export function parseAnatomyFractionInfo(n: Numberish | undefined): AnatomyFractionInfo {
  if (n === undefined) return { numerator: 0n, denominator: 1n }
  const { sign, int, dec, e } = parseAnatomyNumberInfo(n)
  const numerator = BigInt((sign === '-' ? '-' : '') + (int === '0' ? '' : int) + dec) || 0n
  const denominator = BigInt(`1${'0'.repeat((dec?.length ?? 0) + (e ?? 0))}`)
  return { numerator, denominator }
}
