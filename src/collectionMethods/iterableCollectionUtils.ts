import { type Collectionable, type GetCollectionValue, type GetCollectionKey, assert } from ".."
import { getType, isArray, isIterable, isIterator, isMap, isObject, isSet } from "../dataType"

export type IterableCollection<E = any> = Iterable<E> | IterableIterator<E> | Iterator<E>
export function isIterableOrIterator(v: unknown): v is IterableCollection<any> {
  return isIterable(v) || isIterator(v)
}
export function toIterable<T>(target: Iterator<T> | Iterable<T> | IterableIterator<T>): Iterable<T> {
  assert(isIterableOrIterator(target), `toIterable: target is not iterable or iterator`)
  if (isIterable(target)) return target
  if (isIterator(target)) {
    return {
      [Symbol.iterator]() {
        return target
      },
    }
  }
  throw new Error(`toIterable: unsupported target type: ${getType(target)}`)
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
// export function toIterableValue<C extends Collection>(collection: C): IterableIterator<GetCollectionValue<C>> {
//   if (isUndefined(collection)) {
//     return [] as any
//   } else if (isIterable(collection)) {
//     return collection as any
//   } else if (isArray(collection) || isSet(collection)) {
//     return collection as any
//   } else if (isMap(collection)) {
//     return collection.values() as any
//   } else {
//     return Object.values(collection) as any
//   }
// }
// export function toIterableEntries<C extends Collection>(
//   collection: C,
// ): IterableIterator<[key: GetCollectionKey<C>, value: GetCollectionValue<C>]> {
//   if (isUndefined(collection)) {
//     return [] as any
//   } else if (isIterable(collection)) {
//     return collection as any
//   } else if (isSet(collection)) {
//     return collection.entries() as any
//   } else if (isArray(collection)) {
//     return collection.entries() as any
//   } else if (isMap(collection)) {
//     return collection as any
//   } else {
//     return Object.entries(collection) as any
//   }
// }
/** auto-detect whether it should use {@link toIterableValue} or {@link toIterableEntries}
 * @example
 * toIterable([1, 2]) // [1, 2]
 * toIterable({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */

export function toCollectionIterator<C extends Collectionable>(
  collection: C,
): Iterable<[GetCollectionValue<C> | GetCollectionKey<C>]> {
  if (isIterable(collection)) return collection as any
  if (isSet(collection)) return collection.values().map((v, idx) => [v, idx]) as any
  if (isArray(collection)) return collection.values().map((v, idx) => [v, idx]) as any
  if (isMap(collection)) return collection.entries().map(([k, v]) => [v, k]) as any
  if (isObject(collection)) return Object.entries(collection) as any
  throw new Error(`toCollectionIterable: unsupported collection type: ${typeof collection}`)
}
