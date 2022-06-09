import { map, shakeNil } from '..'
import { isArray, isMap } from '../dataType'
import { AnyArr, AnyObj, SKeyof, SValueof } from '../typings'
import { toEntries } from './entries'

/**
 * get
 * @example
 * console.log(groupBy([1, 2, 4, 0], (v) => v % 2 ? 'even' : 'odd' )) // { odd: [1, 0], even: [2, 4] }
 */
export function groupBy<T extends AnyArr, GroupName extends string>(
  arr: T,
  predicate: (item: T[number], index: number, arr: T) => GroupName
): Record<GroupName, Partial<T> | undefined>
export function groupBy<K, V, GroupName extends string>(
  collection: Map<K, V>,
  predicate: (value: V, key: K, map: Map<K, V>) => GroupName
): Record<GroupName, Map<K, V> | undefined>
export function groupBy<O extends AnyObj, GroupName extends string>(
  obj: O,
  predicate: (value: SValueof<O>, key: SKeyof<O>, obj: O) => GroupName
): Record<GroupName, Partial<O> | undefined>
export function groupBy(collection, predicate) {
  return isArray(collection)
    ? jsArrayGroupBy(collection, predicate)
    : isMap(collection)
    ? jsMapGroupBy(collection, predicate)
    : jsObjectGroupBy(collection, predicate)
}

function jsArrayGroupBy<T extends AnyArr, GroupName extends string>(
  arr: T,
  predicate: (item: T[number], index: number, arr: T) => GroupName
): Record<GroupName, Partial<T> | undefined> {
  return arr.reduce((acc, item, idx) => {
    const groupName = predicate(item, idx, arr)
    if (groupName) acc[groupName] = [...(acc[groupName] ?? []), item]
    return acc
  }, {})
}

function jsObjectGroupBy<O extends AnyObj, GroupName extends string>(
  obj: O,
  predicate: (value: SValueof<O>, key: SKeyof<O>, obj: O) => GroupName
): Record<GroupName, Partial<O> | undefined> {
  const entries = toEntries(obj)
  const groupedEntries = jsArrayGroupBy(entries, ([k, v]) => predicate(v, k as SKeyof<O>, obj))
  //@ts-expect-error inner core , no need to worry
  return map(groupedEntries, (entries) => (entries ? Object.fromEntries(shakeNil(entries)) : undefined))
}

function jsMapGroupBy<K, V, GroupName extends string>(
  collection: Map<K, V>,
  predicate: (value: V, key: K, map: Map<K, V>) => GroupName
): Record<GroupName, Map<K, V> | undefined> {
  const entries = toEntries(collection)
  const groupedEntries = jsArrayGroupBy(entries, ([k, v]) => predicate(v, k, collection))
  //@ts-expect-error inner core , no need to worry
  return map(groupedEntries, (entries) => (entries ? new Map(shakeNil(entries)) : undefined))
}
