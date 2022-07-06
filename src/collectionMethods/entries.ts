/**
 * @deprecated
 * @TODO delete
 */

import {
  AnyArr,
  AnyMap,
  AnyObj,
  AnySet,
  Collection,
  Entry,
  GetEntryKey,
  GetEntryValue,
  isArray,
  isMap,
  isObject,
  isSet
} from '../'

/**
 * @example
 * toEntry(toEntry(v, k)) === toEntry(v, k)
 */
export function toEntry<E, K>(value: E, key?: K): E extends Entry ? E : Entry<E, K> {
  // @ts-expect-error force
  return isEntry(value) ? value : ({ key: key, value: value } as Entry<E, K>)
}
/**
 * split collection into pieces
 * ! return iterable
 * @param target Entriesable
 * @returns a list of Entry
 * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
 */
export function toEntries<Key = any, Value = any>(target: Collection<Value, Key>): Iterable<Entry<Value, Key>> {
  if (isArray(target)) return toArrayEntries(target)
  if (isSet(target)) return toSetEntries(target)
  if (isMap(target)) return toMapEntries(target)
  if (isObject(target)) return toObjectEntries(target)
  throw new Error(`#fn:toEntry : ${target} can't transform to Entries`)
}
function* toArrayEntries(arr: AnyArr): Iterable<Entry> {
  for (const [idx, item] of arr.entries()) {
    yield toEntry(item, idx)
  }
}
function* toObjectEntries(obj: AnyObj): Iterable<Entry> {
  for (const [key, value] of Object.entries(obj)) {
    yield toEntry(value, key)
  }
}
function* toSetEntries(arr: AnySet): Iterable<Entry> {
  for (const [randomIdx, item] of arr.entries()) {
    yield toEntry(item, randomIdx)
  }
}
function* toMapEntries(arr: AnyMap): Iterable<Entry> {
  for (const [mapKey, mapValue] of arr.entries()) {
    yield toEntry(mapValue, mapKey)
  }
}
function* mapEntry<E extends Entry, U>(
  entries: Iterable<E>,
  mapFn: (value: GetEntryValue<E>, key: GetEntryKey<E>) => U
) {
  for (const entry of entries) {
    yield mapFn(getEntryValue(entry), getEntryKey(entry))
  }
}

export function isEntry(mayEntry: any): mayEntry is Entry {
  return isObject(mayEntry) && '_key' in mayEntry && '_value' in mayEntry
}

export function getEntryKey<K>(entry: Entry<any, K>): K {
  return entry.key
}
export function getEntryValue<V>(entry: Entry<V>): V {
  return entry.value
}

/**
 * compose pieces into a collection
 * @param entries the return of {@link toEntries `toEntries()`}
 * @param format target collection type (Array, Set, Map, Object)
 */
export function entryToCollection<T = any>(entries: Iterable<Entry<T, any>>, format: 'Array'): T[]
export function entryToCollection<T = any>(entries: Iterable<Entry<T, any>>, format: 'Set'): Set<T>
export function entryToCollection<K = any, V = any>(entries: Iterable<Entry<V, K>>, format: 'Map'): Map<K, V>
export function entryToCollection<K = any, V = any>(entries: Iterable<Entry<V, K>>, format: 'Object'): Record<K & string, V>
export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any
export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any {
  if (format === 'Array') return Array.from(mapEntry(entries, (item) => item))
  if (format === 'Set') return new Set(mapEntry(entries, (item) => item))
  if (format === 'Map') return new Map(mapEntry(entries, (v, k) => [k, v]))
  if (format === 'Object') return Object.fromEntries(mapEntry(entries, (v, k) => [k, v]))
  throw new Error(`format ${format} is not supported`)
}
