import { Collection, Entry } from '../'
import { isArray } from '../dataType'
import { MayArray } from '../typings'
import {
  flatMapCollectionEntries,
  forceEntry,
  GetCollectionKey,
  GetCollectionValue,
  GetNewCollection,
  mapCollection,
  mapCollectionEntries
} from './'
import { toEntry } from './entries'

/**
 * {@link mapEntry `mapEntry()`}
 *
 * entry version of array.prototype.map() , just object an map
 * @requires {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(mapEntry({ a: 1, b: 2 }, (value, key) => [key + 'c', value + 2])) // {  ac: 3, bc: 4 }
 */
export function mapEntry<C extends Collection, V, K = GetCollectionKey<C>>(
  collection: C,
  mapCallback: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => Entry<V, K>
): GetNewCollection<C, V, K> {
  return mapCollectionEntries(collection, mapCallback)
}

export function mapKey<C extends Collection, K>(
  collection: C,
  mapCallback: (key: GetCollectionKey<C>, value: GetCollectionValue<C>, source: C) => K
): GetNewCollection<C, GetCollectionValue<C>, K> {
  return mapEntry(collection, (v, k, s) => forceEntry(v, mapCallback(k, v, s)))
}

/**
 * {@link flatMapEntries `flatMapEntries()`}
 *
 * entry version of array.prototype.flapMap() , just object an map
 * @requires {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(flatMapEntries({ a: 1, b: 2 }, (value, key) => ({ [key + 'c']: value + 2 }))) // {  ac: 3, bc: 4 }
 * console.log(flatMapEntries({ a: 1, b: 2 }, (value, key) => ({ [key]: value, [key + 'c']: value + 2 }))) // { a: 1, ac: 3, b: 2, bc: 4 }
 */
export function flatMapEntries<C extends Collection, V, K>(
  collection: C,
  callback: (
    value: GetCollectionValue<C>,
    key: GetCollectionKey<C>,
    source: C
  ) => MayArray<Entry<V, K> | undefined> | undefined
): GetNewCollection<C, V, K> {
  return flatMapCollectionEntries(collection, callback)
}

/**
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
  mapCallback: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V
): GetNewCollection<C, V, K> {
  return mapCollection(collection, mapCallback)
}

/**
 * {@link flatMap `flatMap()`}: simliar to `array.prototype.flatMap()`
 * @requires {@link mapEntry `mapEntry()`}
 *
 * @example
 * console.log(flatMap([1, 2], (v) => v + 1)) // [2, 3]
 * console.log(flatMap({ a: 1, b: 2}, (v, k) => [k + 'v', v + 1])) // { av: 2, bv: 3 }
 * console.log(flatMap(new Set([1, 2]), (v) => v + 1)) // Set { 2, 3 }
 * console.log(flatMap(new Map([['a', 1], ['b', 2]]), (v) => v + 1)) // Map { 'a' => 2, 'b' => 3 }
 */
export function flatMap<C extends Collection, V, K = GetCollectionKey<C>>(
  collection: C,
  callback: (value: GetCollectionValue<C>, key: GetCollectionKey<C>) => (V | Entry<V, K>)[]
): GetNewCollection<C, V, K> {
  if (isArray(collection)) {
    // @ts-expect-error faster for build-in method, no need type check
    return collection.flatMap(callback)
  }
  return flatMapEntries(collection, (value, key) =>
    callback(value, key).map((newValue) => toEntry(newValue, key))
  ) as any
}

// TODO: asyncMap (already in bonsai)
