import { isArray, isFunction, isMap } from "./dataType"
import { shrinkFn } from "./wrapper"

/**
 * FP style switch, or more accurately, FP style if-else
 * @param key variable to be checked
 * @param rules if match, return the defined value; match rule can be function return value
 * @param getDefaultValue if none matched, return the value returned by this function. If not provided, return undefined
 */
// Array
export function switchCase<T, R>(
  key: T,
  rules: [
    matchCase: NonNullable<T> | ((key: NonNullable<T>) => boolean),
    returnValue: R | ((key: NonNullable<T>) => R),
  ][] /** only invoked if none matched */,
  getDefaultValue: R | ((key: T) => R),
): R
export function switchCase<T, R>(
  key: T,
  rules: [
    matchCase: NonNullable<T> | ((key: NonNullable<T>) => boolean),
    returnValue: R | ((key: NonNullable<T>) => R),
  ][] /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R | undefined

// Map
export function switchCase<T, R>(
  key: T,
  rules: Partial<
    Map<NonNullable<T> | ((key: NonNullable<T>) => boolean), R | ((key: NonNullable<T>) => R)>
  > /** only invoked if none matched */,
  getDefaultValue: R | ((key: T) => R),
): R
export function switchCase<T, R>(
  key: T,
  rules: Map<
    NonNullable<T> | ((key: NonNullable<T>) => boolean),
    R | ((key: NonNullable<T>) => R)
  > /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R
export function switchCase<T, R>(
  key: T,
  rules: Partial<
    Map<NonNullable<T> | ((key: NonNullable<T>) => boolean), R | ((key: NonNullable<T>) => R)>
  > /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R),
): R | undefined

// Record
export function switchCase<T, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<NonNullable<T> & keyof any, R | ((key: NonNullable<T>) => R)>>,
  getDefaultValue: R | ((key: T) => R),
): R
export function switchCase<T, R>(
  key: T,
  /** only invoked if none matched */
  rules: Record<NonNullable<T> & keyof any, R | ((key: NonNullable<T>) => R)>,
  getDefaultValue?: R | ((key: T) => R),
): R
export function switchCase<T, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<NonNullable<T> & keyof any, R | ((key: NonNullable<T>) => R)>>,
  getDefaultValue?: (key: T) => R,
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules:
    | [matchCase: NonNullable<T> | ((key: NonNullable<T>) => boolean), returnValue: R | ((key: NonNullable<T>) => R)][]
    | Partial<Map<NonNullable<T>, R>>
    | Partial<Record<NonNullable<T> & keyof any, R>>,
  /** only invoked if none matched */
  getDefaultValue?: R | ((key: T) => R),
): R | undefined {
  if (key === undefined) return shrinkFn(getDefaultValue, [key])
  const switchRules = isArray(rules) ? rules : isMap(rules) ? rules.entries() : Object.entries(rules)
  for (const [matchCase, returnValue] of switchRules) {
    if (isFunction(matchCase) ? matchCase(key) : key === matchCase) return shrinkFn(returnValue, [key]) as R
  }
  return shrinkFn(getDefaultValue, [key])
}

/**
 * only for key-based object, so, this can have better type inference.
 * But actually is's the same as {@link switchCase}
 * @deprecated just use {@link switchCase} instead
 */
export function switchKey<T extends keyof any | undefined, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<NonNullable<T>, R | ((key: NonNullable<T>) => R)>>,
  getDefaultValue: R | ((key: T) => R),
): R
export function switchKey<T extends keyof any | undefined, R>(
  key: T,
  /** only invoked if none matched */
  rules: Record<NonNullable<T>, R | ((key: NonNullable<T>) => R)>,
  getDefaultValue?: R | ((key: T) => R),
): R
export function switchKey<T extends keyof any | undefined, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<NonNullable<T>, R | ((key: NonNullable<T>) => R)>>,
  getDefaultValue?: (key: T) => R,
): R | undefined
export function switchKey<T, R>(
  key: T,
  rules:
    | [matchCase: NonNullable<T> | ((key: NonNullable<T>) => boolean), returnValue: R | ((key: NonNullable<T>) => R)][]
    | Partial<Map<NonNullable<T>, R>>
    | Partial<Record<NonNullable<T> & keyof any, R>>,
  /** only invoked if none matched */
  getDefaultValue?: R | ((key: T) => R),
): R | undefined {
  // @ts-ignore force
  return switchCase(key, rules, getDefaultValue)
}
