import { toStringNumber } from "./numberishAtom"
import { trimZero } from "./trimZero"
import { Numberish } from "./types"

type AnatomyNumberInfo = {
  sign?: "-" | "+"
  int: string
  dec?: string
  e?: number
}

/**
 *
 * @example
 * getIntInfo(0.34) //=> { numerator: '34', denominator: '100'}
 * getIntInfo('0.34') //=> { numerator: '34', denominator: '100'}
 */
export function parseAnatomyNumberInfo(n: Numberish | undefined): AnatomyNumberInfo {
  if (n === undefined) return { int: "0" }
  const s = toStringNumber(n)
  const [, sign = "", int = "", dec = "", e = ""] = s.match(/([-+]?)(\d*)\.?(\d*)(?:[eE]([+-]?\d+))?/) ?? []
  return { sign: sign as "-" | "+" | undefined, int: int, dec: dec, e: Number(e) }
}
export function buildFromAnatomyNumberInfo(info: AnatomyNumberInfo): string {
  const sign = info.sign === undefined ? "" : info.sign
  const int = info.int === "0" ? "" : info.int.toString()
  const dec = info.dec === undefined || info.dec === "0" ? "" : info.dec.toString()
  const e = info.e === undefined ? 0 : info.e
  const intCount = int.length
  const decimalCount = dec.length

  if (e <= -decimalCount) {
    return trimZero(`${sign}${int + dec}${"0".repeat(-e - decimalCount)}`)
  }
  if (e > intCount) {
    return trimZero(`${sign}0.${"0".repeat(e - intCount)}${int}${dec}`)
  }
  return trimZero(`${sign}${(int + dec).slice(0, intCount - e)}.${(int + dec).slice(-decimalCount - e)}`)
}
