import { isArray, isMap, isObjectLiteral, isSet, isString } from "./dataType"

/**
 * not very elegent yet
 * @example
 * isShallowEqual({ a: ["b", "c"] }, { a: ["b", "c"] }) // true
 * isShallowEqual({ a: ["b", "c", { hello: "world" }] }, { a: ["b", "c", { hello: "world" }] }) // true
 * isShallowEqual(new Map([["test", new Set(["hello", "world"])]]), new Map([["test", new Set(["hello", "world"])]])) // true
 */
export function isShallowEqual(a: any, b: any) {
  if (isMap(a) && isMap(b)) {
    if (Object.is(a, b)) return true
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key)) return false
      if (!isShallowEqual(value, b.get(key))) return false
    }
    return true
  }
  if (isSet(a) && isSet(b)) {
    if (Object.is(a, b)) return true
    if (a.size !== b.size) return false
    return isShallowEqual([...a], [...b])
  }
  if (isArray(a) && isArray(b)) {
    if (Object.is(a, b)) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!isShallowEqual(a[i], b[i])) return false
    }
    return true
  }
  if (isObjectLiteral(a) && isObjectLiteral(b)) {
    if (Object.is(a, b)) return true
    for (const [key, value] of Object.entries(a)) {
      if (!isShallowEqual(value, b[key])) return false
    }
    return true
  }

  return Object.is(a, b)
}

/**
 *
 * check item is part of collector
 * @example
 * isItemContained([1, 2, 3], 2) // true
 * isItemContained({ a: 1, b: 2 }, 2) // true
 * isItemContained(new Set([1, 2, 3]), 2) // true
 * isItemContained(new Map([["a", 1], ["b", 2]]), 2) // true
 * @param a collector
 * @param b check item
 */
export function isItemContained(a: any, b: any): boolean {
  if (isSet(a)) {
    for (const value of a) {
      if (Object.is(value, b)) return true
    }
    return false
  }
  if (isMap(a)) {
    for (const value of a.values()) {
      if (Object.is(value, b)) return true
    }
    return false
  }
  if (isArray(a)) {
    for (const value of a) {
      if (Object.is(value, b)) return true
    }
    return false
  }
  if (isObjectLiteral(a)) {
    for (const value of Object.values(a)) {
      if (Object.is(value, b)) return true
    }
    return false
  }
  if (isString(a)) {
    return a.includes(b)
  }
  return false
}
