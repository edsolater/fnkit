/**
 * @deprecated
 * @TODO delete
 */

import { Collection, Entry, isArray, isMap, isObject, isSet } from '../'

/**
 * split collection into pieces
 * @param target Entriesable
 * @returns a list of Entry
 * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
 */
export function toEntries<Key = any, Value = any>(target: Collection<Value, Key>): Entry<Value, Key>[] {
  if (isArray(target)) return target.map((fragnment, idx) => toEntry(fragnment, idx as unknown as Key))
  if (isSet(target)) return [...target].map((fragnment, idx) => toEntry(fragnment, idx as unknown as Key))
  if (isMap(target)) return [...target.entries()].map(([key, value]) => toEntry(value, key))
  if (isObject(target)) return Object.entries(target).map(([key, value]) => toEntry(value, key))

  throw new Error(`#fn:toEntry : ${target} can't transform to Entries`)
}

/**
 * compose pieces into a collection
 * @param entries the return of {@link toEntries `toEntries()`}
 * @param format target collection type (Array, Set, Map, Object)
 */
export function toCollection<T = any>(entries: Entry<T, any>[], format: 'Array'): T[]
export function toCollection<T = any>(entries: Entry<T, any>[], format: 'Set'): Set<T>
export function toCollection<K = any, V = any>(entries: Entry<V, K>[], format: 'Map'): Map<K, V>
export function toCollection<K = any, V = any>(entries: Entry<V, K>[], format: 'Object'): Record<K & string, V>
export function toCollection(entries: Entry<any, any>[], format: string): any
export function toCollection(entries: Entry<any, any>[], format: string): any {
  if (format === 'Array') return entries.map((entry) => getEntryValue(entry))
  if (format === 'Set') return new Set(entries.map((entry) => getEntryValue(entry)))
  if (format === 'Map') return new Map(entries.map((entry) => [getEntryKey(entry), getEntryValue(entry)]))
  if (format === 'Object') return Object.fromEntries(entries.map((entry) => [getEntryKey(entry), getEntryValue(entry)]))
  throw new Error(`format ${format} is not supported`)
}

export function isEntry(mayEntry: any): mayEntry is Entry {
  return isObject(mayEntry) && '_key' in mayEntry && '_value' in mayEntry
}

export function isArrayTypeCollection(collection: any): collection is any[] | Set<any> {
  return isArray(collection) || isSet(collection)
}

export function toEntry<E, K>(mayEntry: E, defaultKey?: K): E extends Entry ? E : Entry<E, K> {
  // @ts-expect-error force
  return isEntry(mayEntry) ? mayEntry : ([defaultKey, mayEntry] as Entry<E, K>)
}
export function toKeyValueEntry<K extends string, V>(value: V, key: K): Entry<V, K> {
  return toEntry(value, key)
}
export function toItemEntry<I>(item: I): Entry<I> {
  return toEntry(item)
}

export function getEntryKey<K>(entry: Entry<any, K>): K {
  return entry[0]
}
export function getEntryValue<V>(entry: Entry<V>): V {
  return entry[1]
}
