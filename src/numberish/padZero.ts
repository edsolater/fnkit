/**
 * @example
 * padZeroR('30', 3) //=> '30000'
 */
export function padZeroR(str: string, count: number): string {
  return str + Array(count).fill("0").join("")
}
/**
 * @example
 * padZeroL('30', 3) //=> '00030'
 */
export function padZeroL(str: string, count: number): string {
  return Array(count).fill("0").join("") + str
}
