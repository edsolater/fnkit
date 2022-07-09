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
  GetCollectionKey,
  GetCollectionValue,
  GetEntryKey,
  GetEntryValue,
  GetNewCollection,
  getType,
  isArray,
  isMap,
  isObject,
  isSet,
  isUndefined,
  MayArray
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
 * @example
 * forceEntry(forceEntry(v, k)) !== forceEntry(v, k)
 */
export function forceEntry<E, K>(value: E, key: K): Entry<E, K> {
  return { key: key, value: value } as Entry<E, K>
}

/**
 * split collection into pieces
 * ! return iterable
 * @param target Entriesable
 * @returns a list of Entry
 * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
 */
export function forceEntries<N extends any | Entry, Key = any, Value = any>(
  target: Collection<Value, Key>,
  mapFn?: (v: Value, k: Key) => N
): Iterable<Entry<Value, Key>> {
  const jsEntries: Iterable<[any, any]> =
    isArray(target) || isSet(target) || isMap(target) ? target.entries() : Object.entries(target)
  return mapJSInnerEntries(jsEntries, (v, k) => forceEntry(mapFn ? mapFn(v, k) : v, k))
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
  const jsEntries: Iterable<[any, any]> =
    isArray(target) || isSet(target) || isMap(target) ? target.entries() : Object.entries(target)
  return mapJSInnerEntries(jsEntries, (v, k) => toEntry(mapFn ? mapFn(v, k) : v, k))
}
/**
 * split collection into pieces
 * ! return iterable
 * @param target Entriesable
 * @returns a list of Entry
 * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
 */
export function toFlatEntries<N extends MayArray<any | Entry>, Key = any, Value = any>(
  target: Collection<Value, Key>,
  mapFn?: (v: Value, k: Key) => N
): Iterable<MayArray<Entry | N | undefined>> {
  const jsEntries: Iterable<[any, any]> =
    isArray(target) || isSet(target) || isMap(target) ? target.entries() : Object.entries(target)
  return flatMapJSInnerEntries(jsEntries, (v, k) => {
    const nv = mapFn?.(v, k)
    return isArray(nv) ? nv.map((i) => toEntry(i ?? v, k)) : isUndefined(nv) ? undefined : toEntry(nv ?? v, k)
  })
}

function* mapEntries<E extends Entry, U>(
  entries: Iterable<E>,
  mapFn: (value: GetEntryValue<E>, key: GetEntryKey<E>) => U
): Iterable<U> {
  for (const entry of entries) {
    yield mapFn(getEntryValue(entry), getEntryKey(entry))
  }
}

function* mapJSInnerEntries<K, V, U>(entries: Iterable<[K, V]>, mapFn: (value: V, key: K) => U): Iterable<U> {
  for (const [key, value] of entries) {
    const nv = mapFn(value, key)
    if (isUndefined(nv)) {
      continue
    } else {
      yield nv
    }
  }
}
function* flatMapJSInnerEntries<K, V>(entries: Iterable<[K, V]>, mapFn: (value: V, key: K) => unknown): Iterable<any> {
  for (const [key, value] of entries) {
    const newEntry = mapFn(value, key)
    if (isArray(newEntry)) {
      for (const ent of newEntry) {
        if (isUndefined(ent)) {
          continue
        } else {
          yield newEntry
        }
      }
    } else if (isUndefined(newEntry)) {
      continue
    } else {
      yield newEntry
    }
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

export function mapCollection<C extends Collection, U, K = GetCollectionKey<C>>(
  collection: C,
  mapCallback: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => U | undefined
): GetNewCollection<C, U, K> {
  return entryToCollection(
    forceEntries(collection, (v, k) => mapCallback(v, k, collection)),
    getType(collection)
  )
}

export function mapCollectionEntries<C extends Collection, U, K = GetCollectionKey<C>>(
  collection: C,
  mapCallback: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => Entry<U, K> | undefined
): GetNewCollection<C, U, K> {
  return entryToCollection(
    toEntries(collection, (v, k) => mapCallback(v, k, collection)),
    getType(collection)
  )
}
/**
 * mapCallback return multi entry, means add extra item
 * mapCallback return undefined, means delete item
 */
export function flatMapCollectionEntries<C extends Collection, U, K = GetCollectionKey<C>>(
  collection: C,
  mapCallback: (
    value: GetCollectionValue<C>,
    key: GetCollectionKey<C>,
    source: C
  ) => MayArray<Entry<U, K> | undefined> | undefined
): GetNewCollection<C, U, K> {
  // @ts-ignore
  return entryToCollection(
    flatMapCollectionEntries(collection, (v, k) => mapCallback(v, k, collection)) as any,
    getType(collection)
  )
}
