import { isArray, isMap, isFunction } from './dataType'
import type { AnyFn } from './typings'
import { shrinkFn } from './wrapper'

/**
 * FP style switch, or more accurately, FP style if-else
 * @param key variable to be checked
 * @param rules if match, return the defined value; match rule can be function return value
 * @param getDefaultValue if none matched, return the value returned by this function. If not provided, return undefined
 */
export function switchCase<T extends any, R>(
  key: T,
  rules: [
    matchCase: AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
    returnValue: AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
  ][] /** only invoked if none matched */,
  getDefaultValue: R | ((key: T) => R)
): R
export function switchCase<T extends any, R>(
  key: T,
  rules: [
    matchCase: AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
    returnValue: AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
  ][] /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules: Partial<
    Map<
      AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
      AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
    >
  > /** only invoked if none matched */,
  getDefaultValue: R | ((key: T) => R)
): R
export function switchCase<T, R>(
  key: T,
  rules: Map<
    AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
    AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
  > /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R
export function switchCase<T, R>(
  key: T,
  rules: Partial<
    Map<
      AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
      AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
    >
  > /** only invoked if none matched */,
  getDefaultValue?: R | ((key: T) => R)
): R | undefined
export function switchCase<T extends keyof any, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<T, AnyFn extends R ? (key: T) => R : R | ((key: T) => R)>>,
  getDefaultValue: R | ((key: T) => R)
): R
export function switchCase<T extends keyof any, R>(
  key: T,
  /** only invoked if none matched */
  rules: Record<T, AnyFn extends R ? (key: T) => R : R | ((key: T) => R)>,
  getDefaultValue?: R | ((key: T) => R)
): R
export function switchCase<T extends keyof any, R>(
  key: T,
  /** only invoked if none matched */
  rules: Partial<Record<T, AnyFn extends R ? (key: T) => R : R | ((key: T) => R)>>,
  getDefaultValue?: (key: T) => R
): R | undefined
export function switchCase<T, R>(
  key: T,
  rules:
    | [
        matchCase: AnyFn extends T ? (key: T) => boolean : T | ((key: T) => boolean),
        returnValue: AnyFn extends R ? (key: T) => R : R | ((key: T) => R)
      ][]
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
