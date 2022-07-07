import { Collection, Entry, getType } from '../'
import { isArray } from '../dataType'
import { AnyArr, AnyObj, SKeyof, SValueof } from '../typings'
import { GetCollectionKey, GetCollectionValue, GetNewCollection } from './'
import { getEntryKey, getEntryValue, entryToCollection, toEntries, toEntry } from './entries'

/**
 * {@link mapEntry `mapEntry()`}
 *
 * entry version of array.prototype.map() , just object an map
 * @requires {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(mapEntry({ a: 1, b: 2 }, (value, key) => [key + 'c', value + 2])) // {  ac: 3, bc: 4 }
 */
export function mapEntry<O, V, K extends keyof any>(
  collection: O,
  callback: (entry: [key: SKeyof<O>, value: SValueof<O>], obj: O) => [K, V]
): { [P in K]: V } {
  return Object.fromEntries(Object.entries(collection).map(([k, v]) => callback([k as SKeyof<O>, v], collection))) as {
    [P in K]: V
  }
}

/** only object  */
export function mapKey<O extends {}, N extends keyof any>(
  collection: O,
  callback: (key: SKeyof<O>, value: SValueof<O>, obj: O) => N
): { [P in N]: SValueof<O> } {
  return mapEntry(collection, ([key, value], obj) => [callback(key, value, obj), value])
}

/** only Object */

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
  callback: (entry: [key: GetCollectionKey<C>, value: GetCollectionValue<C>]) => Entry<V, K>[]
): GetNewCollection<C, V, K> {
  const entries = [...toEntries(collection)]
  const newEntries = entries.flatMap((entry) => callback([getEntryKey(entry), getEntryValue(entry)]))
  return entryToCollection(newEntries, getType(collection))
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
export default function map<T, N>(arr: readonly T[], mapper: (value: T, index: number, arr: readonly T[]) => N): N[]
export default function map<O, N>(
  collection: O,
  mapper: (value: SValueof<O>, key: SKeyof<O>, collection: O) => N
): Record<SKeyof<O>, N>
export default function map(collection, mapCallback) {
  return isArray(collection)
    ? collection.map(mapCallback)
    : entryToCollection(
        // TODO: mapfn should build in toEntries list Array.from
        // TODO: should test
        mapEntry(toEntries(collection), (v, k) => toEntry(mapCallback(v, k))),
        getType(collection)
      )
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
  return flatMapEntries(collection, ([key, value]) =>
    callback(value, key).map((newValue) => toEntry(newValue, key))
  ) as any
}

// TODO: asyncMap (already in bonsai)
