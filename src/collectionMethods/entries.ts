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
export function toEntries<N extends any | Entry, Key = any, Value = any>(
  target: Collection<Value, Key>,
  mapFn?: (v: Value, k: Key) => N
): Iterable<Entry<Value, Key>> {
  const parseEntry = (v, k) => {
    if (mapFn) {
      const mayEntry = mapFn(v, k)
      return isEntry(mayEntry) ? mayEntry : toEntry(mayEntry, k)
    } else {
      return toEntries(v, k) // actually mapFn must be true
    }
  }
  if (isArray(target))
    return mapFn ? mapEntries(toArrayEntries(target), (v, k) => toEntry(mapFn(v, k), k)) : toArrayEntries(target)
  if (isSet(target)) return mapFn ? mapEntries(toSetEntries(target), parseEntry) : toSetEntries(target)
  if (isMap(target)) return mapFn ? mapEntries(toMapEntries(target), parseEntry) : toMapEntries(target)
  if (isObject(target)) return mapFn ? mapEntries(toObjectEntries(target), parseEntry) : toObjectEntries(target)
  throw new Error(`#fn:toEntry : ${target} can't transform to Entries`)
}
function* toArrayEntries(arr: AnyArr) {
  for (const [idx, item] of arr.entries()) {
    yield toEntry(item, idx)
  }
}
function* toObjectEntries(obj: AnyObj) {
  for (const [key, value] of Object.entries(obj)) {
    yield toEntry(value, key)
  }
}
function* toSetEntries(arr: AnySet) {
  for (const [randomIdx, item] of arr.entries()) {
    yield toEntry(item, randomIdx)
  }
}
function* toMapEntries(arr: AnyMap) {
  for (const [mapKey, mapValue] of arr.entries()) {
    yield toEntry(mapValue, mapKey)
  }
}
function* mapEntries<E extends Entry, U>(
  entries: Iterable<E>,
  mapFn: (value: GetEntryValue<E>, key: GetEntryKey<E>) => U
) {
  for (const entry of entries) {
    yield mapFn(getEntryValue(entry), getEntryKey(entry))
  }
}

export function isEntry(v: any): v is Entry {
  return isObject(v) && 'key' in v && 'value' in v
}

export function isEmptyEntry(v: any): v is Entry {
  return isEntry(v) && getEntryKey(v) === undefined && getEntryValue(v) === undefined
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
export function entryToCollection<K = any, V = any>(
  entries: Iterable<Entry<V, K>>,
  format: 'Object'
): Record<K & string, V>
export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any
export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any {
  if (format === 'Array') return Array.from(mapEntries(entries, (item) => item))
  if (format === 'Set') return new Set(mapEntries(entries, (item) => item))
  if (format === 'Map') return new Map(mapEntries(entries, (v, k) => [k, v]))
  if (format === 'Object') return Object.fromEntries(mapEntries(entries, (v, k) => [k, v]))
  throw new Error(`format ${format} is not supported`)
}
