export type OffsetDepth = number | `${number}%`

export function parseNumberOrPercent(n: OffsetDepth, percentBase: number) {
  return String(n).endsWith('%') ? (Number.parseFloat(String(n)) / 100) * percentBase : (n as number)
}
