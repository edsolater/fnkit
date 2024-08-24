import { cacheFn } from "../cache"
import { isArray, isIterable, isMap, isNumber, isSet, isString, isUndefined } from "../dataType"
import type { Collection, Entries, GetCollectionKey, GetCollectionValue, GetNewCollection } from "./type"
import { toIterableEntries, toIterableValue } from "./entries"
import { count } from "./itemMethods"

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
  options?: {
    /**
     *  only calc needed value when needed
     * 'auto' means if collection size is too big, use lazy mode
     */
    lazy?: boolean | "auto"
  },
): GetNewCollection<C, V, K> {
  if (isUndefined(collection)) return collection as any
  if (isArray(collection)) {
    const needLazy = !options || options?.lazy === "auto" ? count(collection) > 1000 : options?.lazy
    //@ts-expect-error 🤔
    return needLazy ? lazyMapArray(collection, cb) : (collection.map(cb as any) as any)
  } else if (isSet(collection)) {
    const needLazy = !options || options?.lazy === "auto" ? count(collection) > 1000 : options?.lazy
    if (needLazy) {
      //@ts-expect-error force
      return lazyMapSet(collection, cb)
    } else {
      const outputSet = new Set<V>()
      if (cb.length <= 1) {
        for (const v of collection as Set<unknown>) {
          //@ts-expect-error force parameter length is 1
          const mappedV = cb(v)
          outputSet.add(mappedV)
        }
      } else {
        for (const [idx, v] of collection.entries()) {
          // @ts-ignore
          const mappedV = cb(v, idx, collection)
          outputSet.add(mappedV)
        }
      }
      return outputSet as any
    }
  } else if (isMap(collection)) {
    const outputMap = new Map<K, V>()
    for (const [key, value] of collection as Map<any, any>) {
      // @ts-ignore
      const mappedV = cb(value, key, collection)
      outputMap.set(key, mappedV)
    }
    return outputMap as GetNewCollection<C, V, K>
  } else if (isIterable(collection)) {
    return iterableMap(collection, cb) as GetNewCollection<C, V, K>
  } else {
    const needLazy = !options || options?.lazy === "auto" ? true : options?.lazy
    if (needLazy) {
      //@ts-expect-error 🤔
      return lazyMapRecord(collection, cb)
    } else {
      const outputRecord: Record<string, V> = {}
      for (const key in collection) {
        // @ts-ignore
        const mappedV = cb(collection[key], key, collection)
        outputRecord[key] = mappedV
      }
      return outputRecord as GetNewCollection<C, V, K>
    }
  }
}

/** only calc when query the real value */
function lazyMapSet<T, U>(set: Set<T>, cb: (value: T, key: T, source: Set<T>) => U) {
  let haveLoadAll: boolean = false
  let mappedSet = new Set<U>()
  const getItems = cacheFn(() => {
    if (haveLoadAll) return mappedSet
    for (const value of set) {
      // if (mappedSet) continue
      const mappedSetValue = cb(value, value, set)
      mappedSet.add(mappedSetValue)
    }
    haveLoadAll = true
    return mappedSet
  })
  const lazySet = new Proxy(mappedSet, {
    get(_target, key) {
      if (key === "set") {
        return function set(value: U) {
          mappedSet.add(value)
          return lazySet
        }
      }
      if (key === "size") return set.size
      if (key === Symbol.iterator) return iterableMap(set, cb)

      getItems()
      return Reflect.get(mappedSet, key, mappedSet)
    },
  })
  return lazySet
}

/** only calc when query the real value */
function lazyMapArray<T, U>(array: T[], cb: (value: T, idx: number, source: T[]) => U) {
  let haveLoadAll: boolean = false
  let mappedArray: U[] = []
  const getItems = cacheFn(() => {
    if (haveLoadAll) return mappedArray
    for (let i = 0; i < array.length; i++) {
      if (i in mappedArray) continue
      mappedArray[i] = cb(array[i], i, array)
    }
    haveLoadAll = true
    return mappedArray
  })
  return new Proxy(mappedArray, {
    get(target, key) {
      if (isNumber(key) || (isString(key) && /^\d+$/.test(String(key)))) {
        if (key in target) return target[key]
        if (key in array) {
          const mappedValue = cb(array[key], +key, array)
          target[key] = mappedValue
          return mappedValue
        } else {
          return undefined // empty value
        }
      }
      if (key === "length") return array.length
      if (key === Symbol.iterator) return iterableMap(array, cb)
      return Reflect.get(getItems(), key, target)
    },
  })
}
/** only calc when query the real value */
function lazyMapRecord<T, K extends keyof any, U>(
  record: Record<K, T>,
  cb: (value: T, key: K, source: Record<K, T>) => U,
) {
  let mappedRecord = {} as Record<K, U>
  let keys: (string | symbol)[]
  let keySet: Set<string | symbol>

  function getKeys() {
    if (!keys) {
      keys = Reflect.ownKeys(record)
    }
    return keys!
  }
  function getKeySet() {
    if (!keySet) {
      keySet = new Set(getKeys())
    }
    return keySet!
  }

  const getValue = (target: Record<K, U>, key: string | symbol): any => {
    if (!getKeySet().has(key)) return undefined
    if (key in target) return target[key]
    if (key in record) {
      const mappedValue = cb(record[key], key as K, record)
      target[key] = mappedValue
      return mappedValue
    } else {
      return undefined
    }
  }
  return new Proxy(mappedRecord, {
    get: getValue,
    has: (_target, p) => Boolean(getKeySet().has(p)),
    ownKeys: (_target) => getKeys(),
    getOwnPropertyDescriptor: (target, p) => {
      if (!getKeySet().has(p)) return undefined
      return {
        configurable: true,
        enumerable: true,
        value: getValue(target, p),
      }
    },
    set: (target, p, newValue, receiver) => {
      getKeySet().add(p)
      if (!getKeys().includes(p)) {
        getKeys()
      }
      Reflect.set(target, p, newValue, receiver)
      return true
    },
    setPrototypeOf: (target, v) => Reflect.setPrototypeOf(target, v),
  })
}

/**
 *
 * @param collection
 * @param cb
 */
function* iterableMap<C extends Collection, V>(
  collection: C,
  cb: (value: GetCollectionValue<C>, idx: GetCollectionKey<C>, source: C) => V,
): Iterable<V> {
  if (cb.length <= 1) {
    for (const iterator of toIterableValue(collection)) {
      //@ts-expect-error force parameter length is 1
      yield cb(iterator)
    }
  } else {
    for (const [idx, iterator] of toIterableEntries(collection)) {
      yield cb(iterator, idx, collection)
    }
  }
}

// /** iterator map
// just use `pipeDo(toIterable(i), a => map(a, a+1))` is ok*/
// export function* imap<C extends Collection, V>(
//   collection: C,
//   cb: (value: GetCollectionValue<C>, key: GetCollectionKey<C>, source: C) => V,
// ): IterableIterator<V> {
//   if (cb.length <= 1) {
//     for (const value of toIterableValue(collection)) {
//       //@ts-expect-error force parameter length is 1
//       yield cb(value)
//     }
//   } else {
//     for (const [key, value] of toIterableEntries(collection)) {
//       yield cb(value, key, collection)
//     }
//   }
// }
