import { Numberish } from '../typings'
import { div } from './operations'
import { parseNumberInfo } from './parseNumberInfo'
import { FormatOptions, toPrettierNumberString } from './toFormattedNumberString'

/**
 * 1000 => 1K
 * 1000000 => 1M
 * 1000000000 => 1B
 * 1000000000000 => 1T
 */
export function toShortcutNumber(
  n: Numberish,
  options?: {
    disabled?: boolean
  } & FormatOptions
): string {
  const formatFn = (n: Numberish) =>
    toPrettierNumberString(n, {
      decimals: 'auto',
      ...options
    })
  try {
    const { int = '' } = parseNumberInfo(n)
    const numberWeigth = int.length
    if (!options?.disabled && numberWeigth > 3 * 4) return `${formatFn(div(n, 1000000000000))}T`
    if (!options?.disabled && numberWeigth > 3 * 3) return `${formatFn(div(n, 1000000000))}B`
    if (!options?.disabled && numberWeigth > 3 * 2) return `${formatFn(div(n, 1000000))}M`
    if (!options?.disabled && numberWeigth > 3 * 1) return `${formatFn(div(n, 1000))}K`
    return `${formatFn(n)}`
  } catch {
    return '0'
  }
}
