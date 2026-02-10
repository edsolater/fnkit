import { isArray, isMap, isSet } from "../dataType"
import { AnyArr, AnyObj, Keyof, ValueOf } from "../typings"
import { forEach } from "./forEach"
import type { Iteratorable } from "./iteratorableUtils"
import { shakeNil } from "./shakeNil"

type Stringifiable = string | number | undefined
/**
 * get
 * @example
 * console.log(groupBy([1, 2, 4, 0], (v) => v % 2 ? 'even' : 'odd' )) // { odd: [1, 0], even: [2, 4] }
 */
export function groupBy<T extends AnyArr, GroupName extends keyof any>(
  arr: T,
  predicate: (item: T[number], index: number) => GroupName,
): Record<GroupName, T>
export function groupBy<K, V, GroupName extends keyof any>(
  map: Map<K, V>,
  predicate: (value: V, key: K) => GroupName,
): Record<GroupName, Map<K, V>>
export function groupBy<T, GroupName extends keyof any>(
  set: Set<T>,
  predicate: (item: T, index: number) => GroupName,
): Record<GroupName, Set<T>>
export function groupBy<T extends Iteratorable, GroupName extends keyof any>(
  iterable: T,
  predicate: (item: ValueOf<T>, key: Keyof<T>) => GroupName,
): Record<GroupName, T>
export function groupBy<O extends AnyObj, GroupName extends keyof any>(
  obj: O,
  predicate: (value: ValueOf<O>, key: Keyof<O>) => GroupName,
): Record<GroupName, Partial<O>>
export function groupBy(collection, predicate) {
  return shakeNil(
    isArray(collection)
      ? arrayGroupBy(collection, predicate)
      : isSet(collection)
        ? setGroupBy(collection, predicate)
        : isMap(collection)
          ? mapGroupBy(collection, predicate)
          : objectGroupBy(collection, predicate),
  )
}

function arrayGroupBy<T extends AnyArr, GroupName extends Stringifiable>(
  arr: T,
  predicate: (item: T[number], index: number, arr: T) => GroupName,
): Record<NonNullable<GroupName>, T | undefined> {
  return arr.reduce((acc, item, idx) => {
    const groupName = predicate(item, idx, arr)
    if (groupName) acc[String(groupName)] = [...(acc[String(groupName)] ?? []), item]
    return acc
  }, {})
}

function setGroupBy<T, GroupName extends Stringifiable>(
  set: Set<T>,
  predicate: (item: T, index: number) => GroupName,
): Record<NonNullable<GroupName>, Set<T> | undefined> {
  const result: Record<string, Set<T>> = {}
  let index = 0
  forEach(set, (item) => {
    const groupName = predicate(item, index++)
    if (groupName) {
      const key = String(groupName)
      if (!result[key]) result[key] = new Set()
      result[key].add(item)
    }
  })
  return result as any
}

function objectGroupBy<O extends AnyObj, GroupName extends Stringifiable>(
  obj: O,
  predicate: (value: ValueOf<O>, key: Keyof<O>) => GroupName,
): Record<NonNullable<GroupName>, Partial<O> | undefined> {
  const result: Record<string, any> = {}
  forEach(obj, (value, key) => {
    const groupName = predicate(value, key as any)
    if (groupName) {
      const groupKey = String(groupName)
      if (!result[groupKey]) result[groupKey] = {}
      result[groupKey][key] = value
    }
  })
  return result as any
}

function mapGroupBy<K, V, GroupName extends Stringifiable>(
  collection: Map<K, V>,
  predicate: (value: V, key: K) => GroupName,
): Record<NonNullable<GroupName>, Map<K, V> | undefined> {
  const result: Record<string, Map<K, V>> = {}
  forEach(collection, (value, key) => {
    const groupName = predicate(value, key)
    if (groupName) {
      const groupKey = String(groupName)
      if (!result[groupKey]) result[groupKey] = new Map()
      result[groupKey].set(key, value)
    }
  })
  return result as any
}
