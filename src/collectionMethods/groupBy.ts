import { getEntryKey, getEntryValue, map, shakeNil } from ".."
import { isArray, isMap } from "../dataType"
import { AnyArr, AnyObj, SKeyof, Valueof } from "../typings"
import { toEntries } from "./entries"

/**
 * get
 * @example
 * console.log(groupBy([1, 2, 4, 0], (v) => v % 2 ? 'even' : 'odd' )) // { odd: [1, 0], even: [2, 4] }
 */
export function groupBy<T extends AnyArr, GroupName extends string | number | undefined>(
  arr: T,
  predicate: (item: T[number], index: number, arr: T) => GroupName,
): Record<NonNullable<GroupName>, T>
export function groupBy<K, V, GroupName extends string | number | undefined>(
  collection: Map<K, V>,
  predicate: (value: V, key: K, map: Map<K, V>) => GroupName,
): Record<NonNullable<GroupName>, Map<K, V>>
export function groupBy<O extends AnyObj, GroupName extends string | number | undefined>(
  obj: O,
  predicate: (value: Valueof<O>, key: SKeyof<O>, obj: O) => GroupName,
): Record<NonNullable<GroupName>, Partial<O>>
export function groupBy(collection, predicate) {
  return shakeNil(
    isArray(collection)
      ? jsArrayGroupBy(collection, predicate)
      : isMap(collection)
      ? jsMapGroupBy(collection, predicate)
      : jsObjectGroupBy(collection, predicate),
  )
}

function jsArrayGroupBy<T extends AnyArr, GroupName extends string | number | undefined>(
  arr: T,
  predicate: (item: T[number], index: number, arr: T) => GroupName,
): Record<NonNullable<GroupName>, T | undefined> {
  return arr.reduce((acc, item, idx) => {
    const groupName = predicate(item, idx, arr)
    if (groupName) acc[groupName] = [...(acc[groupName] ?? []), item]
    return acc
  }, {})
}

function jsObjectGroupBy<O extends AnyObj, GroupName extends string | number | undefined>(
  obj: O,
  predicate: (value: Valueof<O>, key: SKeyof<O>, obj: O) => GroupName,
): Record<NonNullable<GroupName>, Partial<O> | undefined> {
  const entries = [...toEntries(obj)]
  const groupedEntries = jsArrayGroupBy(entries, (entry) =>
    predicate(getEntryValue(entry), getEntryKey(entry) as SKeyof<O>, obj),
  )
  //@ts-expect-error inner core , no need to worry
  return map(groupedEntries, (entries) => (entries ? Object.fromEntries(shakeNil(entries)) : undefined))
}

function jsMapGroupBy<K, V, GroupName extends string | number | undefined>(
  collection: Map<K, V>,
  predicate: (value: V, key: K, map: Map<K, V>) => GroupName,
): Record<NonNullable<GroupName>, Map<K, V> | undefined> {
  const entries = [...toEntries(collection)]
  const groupedEntries = jsArrayGroupBy(entries, (entry) =>
    predicate(getEntryValue(entry), getEntryKey(entry), collection),
  )
  //@ts-expect-error inner core , no need to worry
  return map(groupedEntries, (entries) => (entries ? new Map(shakeNil(entries)) : undefined))
}
