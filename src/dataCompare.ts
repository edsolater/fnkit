import { isArray, isMap, isObjectLiteral, isSet, isString } from "./dataType"

/**
 * not very elegent yet
 * @example
 * isShallowEqual({ a: ["b", "c"] }, { a: ["b", "c"] }) // true
 * isShallowEqual({ a: ["b", "c", { hello: "world" }] }, { a: ["b", "c", { hello: "world" }] }) // true
 * isShallowEqual(new Map([["test", new Set(["hello", "world"])]]), new Map([["test", new Set(["hello", "world"])]])) // true
 */
export function isShallowEqual(a: any, b: any) {
  if (a === b) return true

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
 * check item is part of collector\
 * use {@link isShallowEqual} to compare
 * @example
 * isItemContainedIn([1, 2, 3], 2) // true
 * isItemContainedIn({ a: 1, b: 2 }, 2) // true
 * isItemContainedIn(new Set([1, 2, 3]), 2) // true
 * isItemContainedIn(new Map([["a", 1], ["b", 2]]), 2) // true
 * @param collector collector
 * @param item check item
 */
export function isItemContainedIn(collector: any, item: any): boolean {
  if (isSet(collector)) {
    for (const value of collector) {
      if (isShallowEqual(value, item)) return true
    }
    return false
  }
  if (isMap(collector)) {
    for (const value of collector.values()) {
      if (isShallowEqual(value, item)) return true
    }
    return false
  }
  if (isArray(collector)) {
    for (const value of collector) {
      if (isShallowEqual(value, item)) return true
    }
    return false
  }
  if (isObjectLiteral(collector)) {
    for (const value of Object.values(collector)) {
      if (isShallowEqual(value, item)) return true
    }
    return false
  }
  if (isString(collector)) {
    return collector.includes(item)
  }
  return false
}

/**
 *
 * check smallerCollector is sub of biggerCollector\
 * use {@link isShallowEqual} to compare
 * @example
 * isSubCollectorOf([1, 2, 3], [2]) // true
 * isSubCollectorOf({ a: 1, b: 2, c: 3 }, { b: 2, c: 3 }) // true
 * isSubCollectorOf({ a: 1, b: 2 }, { a: 2 }) // false
 * isSubCollectorOf(new Set([1, 2, 3]), new Set([2])) // true
 * isSubCollectorOf(new Map([["a", [4]], ["b", [1, 2]]]), new Map([["b", [1, 2]]])) // true
 *
 * @param biggerCollector bigger collector
 * @param smallerCollector smaller collector
 */
export function isSubCollectorOf(biggerCollector: any, smallerCollector: any): boolean {
  if (isSet(biggerCollector) && isSet(smallerCollector)) {
    const aArr = [...smallerCollector]
    const bArr = [...biggerCollector]
    return aArr.every((value) => isItemContainedIn(bArr, value))
  }
  if (isMap(biggerCollector) && isMap(smallerCollector)) {
    for (const key of smallerCollector.keys()) {
      if (!biggerCollector.has(key)) return false
      const bValue = biggerCollector.get(key)
      const aValue = smallerCollector.get(key)
      if (!isShallowEqual(bValue, aValue)) return false
    }
    return true
  }
  if (isArray(biggerCollector) && isArray(smallerCollector)) {
    return smallerCollector.every((value) => isItemContainedIn(biggerCollector, value))
  }
  if (isObjectLiteral(biggerCollector) && isObjectLiteral(smallerCollector)) {
    for (const [key, value] of Object.entries(smallerCollector)) {
      if (!(key in biggerCollector)) return false
      const bValue = biggerCollector[key]
      if (!isShallowEqual(bValue, value)) return false
    }
    return true
  }
  if (isString(biggerCollector) && isString(smallerCollector)) {
    return biggerCollector.includes(smallerCollector)
  }
  return false
}
