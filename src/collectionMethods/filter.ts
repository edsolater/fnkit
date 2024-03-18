import { isArray, isIterable, isMap, isSet } from "../dataType"
import type { AnyObj, SKeyof, Valueof } from "../typings"
import type { Collection, GetCollectionKey, GetCollectionValue, GetNewCollection } from "./collection.type"
import { toIterableEntries, toIterableValue } from "./entries"

/**
 * @example
 * console.log(filter([1, 2], (v) => v > 1)) // [2]
 * console.log(filter(new Set([1, 2]), (v) => v > 1)) // Set { 2 }
 * console.log(filter(new Map([ ['a', 1], ['b', 2] ]), (v) => v > 1 )) // Map { 'b' => 2 }
 * console.log(filter({ a: 1, b: 2 }, (v) => v > 1)) // { b: 2 }
 * @version 0.0.1
 */
export function filter<C extends Collection, V extends GetCollectionValue<C>>(
  collection: C,
  predicate: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => value is V,
): GetNewCollection<C, V, GetCollectionKey<C>>
export function filter<C extends Collection>(
  collection: C,
  predicate: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => unknown,
): C
export function filter<C extends Collection, V>(
  collection: C,
  predicate: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V,
): any {
  if (isArray(collection)) return collection.filter(predicate as any)
  else if (isSet(collection)) {
    const outputSet = new Set()
    if (predicate.length <= 1) {
      for (const v of collection as Set<unknown>) {
        //@ts-expect-error force parameter length is 1
        const result = predicate(v)
        if (result) outputSet.add(v)
      }
    } else {
      for (const [idx, v] of collection.entries()) {
        // @ts-ignore
        const result = predicate(v, idx, collection)
        if (result) outputSet.add(v)
      }
    }
    return outputSet
  } else if (isMap(collection)) {
    const outputMap = new Map()
    for (const [key, value] of collection as Map<any, any>) {
      // @ts-ignore
      const result = predicate(value, key, collection)
      if (result) outputMap.set(key, value)
    }
    return outputMap
  } else if (isIterable(collection)) {
    return (function* () {
      if (predicate.length <= 1) {
        for (const iterator of toIterableValue(collection)) {
          //@ts-expect-error force parameter length is 1
          if (predicate(iterator)) yield iterator
        }
      } else {
        for (const [key, value] of toIterableEntries(collection)) {
          if (predicate(value, key, collection)) yield value
        }
      }
    })()
  } else {
    const outputRecord: AnyObj = {}
    for (const key in collection) {
      // @ts-ignore
      const result = predicate(collection[key], key, collection)
      if (result) outputRecord[key] = collection[key]
    }
    return outputRecord
  }
}

export function ifilter<C extends Collection, V>(
  collection: C,
  predicate: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V,
): IterableIterator<V> {
  return (function* () {
    if (predicate.length <= 1) {
      for (const iterator of toIterableValue(collection)) {
        //@ts-expect-error force parameter length is 1
        if (predicate(iterator)) yield iterator
      }
    } else {
      for (const [key, value] of toIterableEntries(collection)) {
        if (predicate(value, key, collection)) yield value
      }
    }
  })()
}

/**
 * @deprecated just use filter is enough
 */
export function filterEntry<O extends object, V extends Valueof<O>, K extends keyof any>(
  collection: O,
  predicate: (entry: [key: SKeyof<O>, value: Valueof<O>], obj: O) => unknown,
): { [P in K]?: V } {
  return Object.fromEntries(
    Object.entries(collection).filter(([k, v]) => predicate([k as SKeyof<O>, v], collection)),
  ) as {
    [P in K]?: V
  }
}

/** @dreprecated old,  */
export function filterKey<O extends object, K extends keyof O>(
  collection: O,
  predicate: (key: SKeyof<O>, value: Valueof<O>, obj: O) => unknown,
): { [P in K]?: O[P] } {
  return filterEntry(collection, ([k, v]) => predicate(k, v, collection)) as {
    [P in K]?: O[P]
  }
}
