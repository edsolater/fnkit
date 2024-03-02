/**
 *
 * @example
 * trimZero('-33.33000000') //=> '-33.33'
 * trimZero('-33.000000') //=> '-33'
 * trimZero('.000000') //=> '0'
 */
export function shakeTailingZero(s: string): string {
  const n = s.replace(/\.?0+$/, '')
  return n === '' ? '0' : n
}

export function trimZero(s: string): string {
  return addHeadingZero(shakeTailingZero(s))
}

export function addHeadingZero(s: string): string {
  return s.startsWith('.') ? '0' + s : s
}
