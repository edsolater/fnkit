/**
 * @deprecated
 * @TODO delete
 */

import {
  Entry,
  GetCollectionKey,
  GetCollectionValue,
  isArray,
  isIterable,
  isMap,
  isObject,
  isObjectLiteral,
  isSet,
  isUndefined,
  map,
  type Collection,
  type Entries,
  type Items,
} from "../"

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
  return Array.from(toIterable(target)).map((v, k) => toEntry(v, k))
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

// /**
//  * compose pieces into a collection
//  * @param entries the return of {@link toEntries `toEntries()`}
//  * @param format target collection type (Array, Set, Map, Object)
//  */
// export function entryToCollection<T = any>(entries: Iterable<Entry<T, any>>, format: "Array"): T[]
// export function entryToCollection<T = any>(entries: Iterable<Entry<T, any>>, format: "Set"): Set<T>
// export function entryToCollection<K = any, V = any>(entries: Iterable<Entry<V, K>>, format: "Map"): Map<K, V>
// export function entryToCollection<K = any, V = any>(
//   entries: Iterable<Entry<V, K>>,
//   format: "Object",
// ): Record<K & string, V>
// export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any
// export function entryToCollection(entries: Iterable<Entry<any, any>>, format: string): any {
//   if (format === "Array") return Array.from(mapEntries(entries))
//   if (format === "Set") return new Set(mapEntries(entries))
//   if (format === "Map") return new Map(mapEntries(entries, (v, k) => [k, v]))
//   if (format === "Object") return Object.fromEntries(mapEntries(entries, (v, k) => [isSymbol(k) ? k : String(k), v]))
//   throw new Error(`format ${format} is not supported`)
// }

// export function mapCollectionValue<C extends Items, V = GetCollectionValue<C>, K = GetCollectionKey<C>>(
//   collection: C,
//   cb: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V | undefined,
// ): GetNewCollection<C, V, K> {
//   if (isArray(collection)) {
//     return (collection as any[]).map(cb as any) as any
//   } else if (isSet(collection)) {
//     const outputSet = new Set<V>()
//     if (cb.length === 1) {
//       for (const v of collection as Set<unknown>) {
//         //@ts-expect-error force parameter length is 1
//         const mappedV = cb(v)
//         if (mappedV !== undefined) outputSet.add(mappedV)
//       }
//     } else {
//       for (const [idx, v] of collection.entries()) {
//         // @ts-ignore
//         const mappedV = cb(v, idx, collection)
//         if (mappedV !== undefined) outputSet.add(mappedV)
//       }
//     }
//     return outputSet as any
//   } else if (isMap(collection)) {
//     const outputSet = new Map<K, V>()
//     for (const [key, value] of collection as Map<any, any>) {
//       // @ts-ignore
//       const mappedV = cb(value, key, collection)
//       if (mappedV == undefined) continue
//       outputSet.set(key, mappedV)
//     }
//     return outputSet as any
//   } else {
//     const outputSet: Record<string, V> = {}
//     for (const key in collection) {
//       // @ts-ignore
//       const mappedV = cb(collection[key], key, collection)
//       if (mappedV === undefined) continue
//       outputSet[key] = mappedV
//     }
//     return outputSet as any
//   }
// }

// /**
//  * mapCallback return multi entry, means add extra item
//  * mapCallback return undefined, means delete item
//  */
// export function flatMapCollectionEntries<C extends Items, U, K = GetCollectionKey<C>>(
//   collection: C,
//   mapCallback: (
//     value: GetCollectionValue<C>,
//     key: GetCollectionKey<C>,
//     source: C,
//   ) => MayArray<Entry<U, K> | undefined> | undefined,
// ): GetNewCollection<C, U, K> {
//   return isArray(collection)
//     ? shakeUndefinedItem(
//         // use build-in array methods if possiable
//         collection.flatMap((i, idx, source) => {
//           // @ts-ignore
//           const result = mapCallback(i, idx as Key, source)
//           return isArray(result) ? shakeUndefinedItem(result.map((i) => i?.value)) : result?.value
//         }),
//       )
//     : entryToCollection(
//         toFlatEntries(collection, (v, k) => mapCallback(v, k as any, collection)) as any,
//         getType(collection),
//       )
// }

export function toIterableValue<C extends Collection>(collection: C): IterableIterator<GetCollectionValue<C>> {
  if (isUndefined(collection)) {
    return [] as any
  } else if (isIterable(collection)) {
    return collection as any
  } else if (isArray(collection) || isSet(collection)) {
    return collection as any
  } else if (isMap(collection)) {
    return collection.values() as any
  } else {
    return Object.values(collection) as any
  }
}
export function toIterableEntries<C extends Collection>(
  collection: C,
): IterableIterator<[key: GetCollectionKey<C>, value: GetCollectionValue<C>]> {
  if (isUndefined(collection)) {
    return [] as any
  } else if (isIterable(collection)) {
    return collection as any
  } else if (isSet(collection)) {
    return collection.entries() as any
  } else if (isArray(collection)) {
    return collection.entries() as any
  } else if (isMap(collection)) {
    return collection as any
  } else {
    return Object.entries(collection) as any
  }
}

/** auto-detect whether it should use {@link toIterableValue} or {@link toIterableEntries}
 * @example
 * toIterable([1, 2]) // [1, 2]
 * toIterable({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function toIterable<C extends Items>(items: C): IterableIterator<GetCollectionValue<C>>
export function toIterable<C extends Entries>(
  collection: C,
): IterableIterator<[GetCollectionKey<C>, GetCollectionValue<C>]>
export function toIterable<C extends Collection>(
  collection: C,
): IterableIterator<GetCollectionValue<C> | [GetCollectionKey<C>, GetCollectionValue<C>]> {
  if (isUndefined(collection)) {
    return [] as any
  } else if (isIterable(collection)) {
    return collection as any
  }
  if (isSet(collection) || isArray(collection)) {
    return toIterableValue(collection)
  } else {
    return toIterableEntries(collection)
  }
}
