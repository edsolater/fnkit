import { isArray, isMap, isFunction } from './dataType'
import { shrinkFn } from './wrapper'

/**
 * FP style switch, or more accurately, FP style if-else
 * @param key variable to be checked
 * @param rules if match, return the defined value; match rule can be function return value
 * @param getDefaultValue if none matched, return the value returned by this function. If not provided, return undefined
 */
export function switchCase<T, R>(
  key: T,
  rules: Partial<Map<T | ((key: T) => boolean), R | ((key: T) => R)>> /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules: [matchCase: T | ((key: T) => boolean), returnValue: R | ((key: T) => R)][] /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R | undefined
export function switchCase<T extends keyof any, R>(
  key: T,
  rules: Partial<Record<T, R | ((key: T) => R)>> /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules:
    | [matchCase: T | ((key: T) => boolean), returnValue: R | ((key: T) => R)][]
    | Partial<Map<T, R>>
    | Partial<Record<T & keyof any, R>>,
  /** only invoked if none matched */
  getDefaultValue?: R | ((key: T) => R)
): R | undefined {
  const switchRules = isArray(rules) ? rules : isMap(rules) ? rules.entries() : Object.entries(rules)
  for (const [matchCase, returnValue] of switchRules) {
    if (isFunction(matchCase) ? matchCase(key) : key === matchCase) return shrinkFn(returnValue, [key]) as R
  }
  return shrinkFn(getDefaultValue, [key])
}
