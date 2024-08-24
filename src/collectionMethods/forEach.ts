import { AnyObj, isArray, isIterable, isMap, isObjectLike, isSet } from ".."

/** the Method of map`filter`some etc. */
export function forEach<T>(
  collection: readonly T[],
  predicate: (item: T, index: number, arr: readonly T[]) => void,
): void
export function forEach<K>(collection: Set<K>, predicate: (item: K, itemSelfKey: K, original: Set<K>) => void): void
export function forEach<K, V>(collection: Map<K, V>, predicate: (value: V, key: K, original: Map<K, V>) => void): void
export function forEach<O extends AnyObj>(
  collection: O,
  predicate: (value: O[keyof O], key: keyof O, obj: O) => void,
): void
export function forEach(collection, predicate) {
  if (!collection) return
  if (isArray(collection)) {
    return collection.forEach(predicate)
  } else if (isSet(collection)) {
    for (const k of collection) predicate(k, k, collection)
  } else if (isMap(collection)) {
    for (const [k, v] of collection) predicate(v, k, collection)
  } else if (isIterable(collection)) {
    for (const v of collection) {
      if (isArray(v) && v.length === 2) predicate(v[1], v[0], collection)
      if (isObjectLike(v) && "value" in v && "key" in v) predicate(v.value, v.key, collection)
      if (v) predicate(v, v, collection)
    }
  } else {
    Object.entries(collection).forEach(([k, v]) => predicate([k, v], collection))
  }
}

export function forEachKey<O extends AnyObj>(
  collection: O,
  predicate: (key: keyof O, value: O[keyof O], obj: O) => void,
): void {
  // @ts-ignore force for alias
  return forEach(collection, (_, k, v) => predicate(k, v, collection))
}
