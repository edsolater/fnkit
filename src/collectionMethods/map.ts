import { isArray, isIterable, isMap, isSet } from "../"
import { GetCollectionKey, GetCollectionValue, GetNewCollection, type Collection, type Entries } from "./"
import { toIterableValue, toIterableEntries } from "./entries"

/**
 * change collection's both value and key
 * {@link mapEntry `mapEntry()`}
 *
 * entry version of array.prototype.map() , just object an map
 * @requires {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(mapEntry({ a: 1, b: 2 }, (value, key) => [key + 'c', value + 2])) // {  ac: 3, bc: 4 }
 */
export function mapEntry<E extends Entries, V, K = GetCollectionKey<E>>(
  collection: E,
  cb: (value: GetCollectionValue<E>, key: GetCollectionKey<E>, source: E) => [K, V],
): GetNewCollection<E, V, K> {
  if (isMap(collection)) {
    const outputSet = new Map<K, V>()
    for (const [key, value] of collection as Map<any, any>) {
      // @ts-ignore
      const [mappedK, mappedV] = cb(value, key, collection)
      if (mappedV == undefined) continue
      outputSet.set(mappedK, mappedV)
    }
    return outputSet as any
  } else if (isIterable(collection)) {
    // @ts-ignore
    return (function* () {
      if (cb.length <= 1) {
        for (const iterator of toIterableValue(collection)) {
          //@ts-expect-error force parameter length is 1
          yield cb(iterator)
        }
      }
      for (const [key, value] of toIterableEntries(collection)) {
        yield cb(value, key, collection)
      }
    })()
  } else {
    const outputSet: Record<any, V> = {}
    for (const key in collection) {
      // @ts-ignore
      const [mappedK, mappedV] = cb(collection[key], key, collection)
      if (mappedV === undefined) continue
      // @ts-ignore
      outputSet[mappedK] = mappedV
    }
    return outputSet as any
  }
}

/**
 * only change collection's value
 * {@link map `map()`}: simliar to array.prototype.map()
 * @requires {@link mapEntry `mapEntry()`}
 *
 * @example
 * console.log(map([1, 2], (v) => v + 1)) // [2, 3]
 * console.log(map({ a: 1, b: 2}, (v, k) => [k + 'v', v + 1])) // { av: 2, bv: 3 }
 * console.log(map(new Set([1, 2]), (v) => v + 1)) // Set { 2, 3 }
 * console.log(map(new Map([['a', 1], ['b', 2]]), (v) => v + 1)) // Map { 'a' => 2, 'b' => 3 }
 */
export function map<C extends Collection, V, K = GetCollectionKey<C>>(
  collection: C,
  cb: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V,
): GetNewCollection<C, V, K> {
  if (isArray(collection)) {
    return (collection as any[]).map(cb as any) as any
  } else if (isSet(collection)) {
    const outputSet = new Set<V>()
    if (cb.length <= 1) {
      for (const v of collection as Set<unknown>) {
        //@ts-expect-error force parameter length is 1
        const mappedV = cb(v)
        if (mappedV !== undefined) outputSet.add(mappedV)
      }
    } else {
      for (const [idx, v] of collection.entries()) {
        // @ts-ignore
        const mappedV = cb(v, idx, collection)
        if (mappedV !== undefined) outputSet.add(mappedV)
      }
    }
    return outputSet as any
  } else if (isMap(collection)) {
    const outputSet = new Map<K, V>()
    for (const [key, value] of collection as Map<any, any>) {
      // @ts-ignore
      const mappedV = cb(value, key, collection)
      if (mappedV == undefined) continue
      outputSet.set(key, mappedV)
    }
    return outputSet as any
  } else if (isIterable(collection)) {
    // @ts-ignore
    return (function* () {
      if (cb.length <= 1) {
        for (const iterator of toIterableValue(collection)) {
          //@ts-expect-error force parameter length is 1
          yield cb(iterator)
        }
      }
      for (const [key, value] of toIterableEntries(collection)) {
        yield cb(value, key, collection)
      }
    })()
  } else {
    const outputSet: Record<string, V> = {}
    for (const key in collection) {
      // @ts-ignore
      const mappedV = cb(collection[key], key, collection)
      if (mappedV === undefined) continue
      outputSet[key] = mappedV
    }
    return outputSet as any
  }
}

/** iterator map */
export function* imap<C extends Collection, V>(
  collection: C,
  cb: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V,
): IterableIterator<V> {
  if (cb.length <= 1) {
    for (const value of toIterableValue(collection)) {
      //@ts-expect-error force parameter length is 1
      yield cb(value)
    }
  } else {
    for (const [key, value] of toIterableEntries(collection)) {
      yield cb(value, key, collection)
    }
  }
}

/** iterator map */
export function* imapEntry<C extends Collection, V, K = GetCollectionKey<C>>(
  collection: C,
  cb: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => [K, V],
): IterableIterator<[K, V]> {
  for (const [key, value] of toIterableEntries(collection)) {
    yield cb(value, key, collection)
  }
}
