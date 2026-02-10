/**
 * @deprecated
 * @TODO delete
 */

import {
  Entry,
  GetCollectionKey,
  GetCollectionValue,
  isArray,
  isObject,
  isObjectLiteral,
  isUndefined,
  map,
  type Collection,
  type CollectionEntries,
  type CollectionItems,
} from "../"
import { toCollectionIterator } from "./iterableCollectionUtils"

/**
 * there two types of Entry, `[key, value]` and `{key, value}` (e.g. `['a', 1]` and `{key: 'a', value: 1}`)
 * @example
 * toEntry(toEntry(v, k)) === toEntry(v, k)
 */
export function toEntry<E, K>(value: E, key?: K): E extends Entry ? E : Entry<E, K> {
  // @ts-expect-error force
  return isEntry(value) ? value : ({ key: key, value: value } as Entry<E, K>)
}

// /**
//  * @example
//  * forceEntry(forceEntry(v, k)) !== forceEntry(v, k)
//  */
// export function forceEntry<E, K>(value: E, key: K): Entry<E, K> {
//   return { key: key, value: value } as Entry<E, K>
// }

/**
 * split collection into pieces
 * ! return iterable
 * @param target Entriesable
 * @returns a list of Entry
 * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
 */
export function toEntries<C extends Collection>(target: C): Array<Entry<GetCollectionValue<C>, GetCollectionKey<C>>> {
  return Array.from(toCollectionIterator(target)).map((v, k) => toEntry(v, k))
}
// /**
//  * split collection into pieces
//  * ! return iterable
//  * @param target Entriesable
//  * @returns a list of Entry
//  * @requires {@link isArray `isArray()`} {@link isMap `isMap()`} {@link isObject `isObject()`} {@link isSet `isSet()`}
//  */
// export function toFlatEntries<N extends MayArray<any | Entry>, Key = any, Value = any>(
//   target: Collection<Value, Key>,
//   mapFn?: (v: Value, k: Key) => N,
// ): Iterable<MayArray<Entry | N | undefined>> {
//   const jsEntries: Iterable<[any, any]> =
//     isArray(target) || isSet(target) || isMap(target) ? target.entries() : Object.entries(target ?? {})
//   return flatMapJSEntries(jsEntries, (v, k) => {
//     const nv = mapFn?.(v, k)
//     return isArray(nv) ? nv.map((i) => toEntry(i ?? v, k)) : isUndefined(nv) ? undefined : toEntry(nv ?? v, k)
//   })
// }

// function* mapEntries<E extends Entry, U = GetEntryValue<E>>(
//   entries: Iterable<E>,
//   mapFn?: (value: GetEntryValue<E>, key: GetEntryKey<E>) => U,
// ): Iterable<U> {
//   for (const entry of entries) {
//     yield mapFn ? mapFn(getEntryValue(entry), getEntryKey(entry)) : getEntryValue(entry)
//   }
// }

// function shakeJSEntries<K, V>(entries: Iterable<[K, V]>): Iterable<V>
// function shakeJSEntries<K, V, U>(entries: Iterable<[K, V]>, mapFn: (value: V, key: K) => U): Iterable<U>
// function* shakeJSEntries<K, V, U = V>(entries: Iterable<[K, V]>, mapFn?: (value: V, key: K) => U): Iterable<U | V> {
//   for (const [key, value] of entries) {
//     const nv = mapFn ? mapFn(value, key) : value
//     if (isUndefined(nv)) {
//       continue
//     } else {
//       yield nv
//     }
//   }
// }
// function* flatMapJSEntries<K, V>(entries: Iterable<[K, V]>, mapFn: (value: V, key: K) => unknown): Iterable<any> {
//   for (const [key, value] of entries) {
//     const newEntry = mapFn(value, key)
//     if (isArray(newEntry)) {
//       for (const entry of newEntry) {
//         if (isUndefined(entry)) {
//           continue
//         } else {
//           yield entry
//         }
//       }
//     } else if (isUndefined(newEntry)) {
//       continue
//     } else {
//       yield newEntry
//     }
//   }
// }

export function isEntry(v: any): v is Entry {
  return (isArray(v) && v.length === 2) || (isObject(v) && "key" in v && "value" in v)
}

export function isEmptyEntry(v: any): v is Entry {
  return isEntry(v) && getEntryKey(v) === undefined && getEntryValue(v) === undefined
}

export function getEntryKey<K>(entry: Entry<any, K>): K {
  return isArray(entry) ? entry[0] : entry.key
}
export function getEntryValue<V>(entry: Entry<V>): V {
  return isArray(entry) ? entry[1] : entry.value
}
