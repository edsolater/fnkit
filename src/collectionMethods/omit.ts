import { flap } from '.'
import { AnyObj, isArray, isMap, isSet, MayArray } from '..'

/**
 * like typescript Omit
 * for object/map has key. (mainly object and map)
 * @example
 * console.log(omit({ a: 1, b: true }, ['a'])) //=> { b: true }
 */
export function omit<T>(collection: T[], itemList: MayArray<T>): T[]
export function omit<T extends Map<any, any>, U extends keyof T>(collection: T, keyList: MayArray<U>): T
export function omit<T>(collection: Set<T>, itemList: MayArray<T>): Set<T>
export function omit<T extends AnyObj, U extends keyof T>(collection: T, propNameList: MayArray<U>): Omit<T, U>
export function omit<T extends AnyObj | Map<any, any>, U extends keyof T>(
  collection: T,
  propNameList: MayArray<U>
): any {
  return isArray(collection)
    ? omitItems(collection, propNameList)
    : isMap(collection)
    ? omitMap(collection, propNameList)
    : isSet(collection)
    ? omitSetItems(collection, propNameList)
    : omitObject(collection, propNameList)
}

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to omit from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
function omitItems<T>(arr: T[], items: T | T[]): T[] {
  const omitSet = new Set(Array.isArray(items) ? items : [items])
  return arr.filter((item) => !omitSet.has(item))
}

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to omit from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
function omitSetItems<T>(set: Set<T>, items: T | T[]): Set<T> {
  const omitSet = new Set(Array.isArray(items) ? items : [items])
  const newSet = new Set(set)
  for (const item of omitSet) {
    newSet.delete(item)
  }
  return newSet
}

function omitMap<T extends Map<any, any>>(map: T, keys: MayArray<any>): T {
  const newMap = new Map(map)
  flap(keys).forEach((k) => {
    newMap.delete(k)
  })
  return newMap as T
}
function omitObject<T extends AnyObj, U extends keyof T>(obj: T, keys: MayArray<U>): Omit<T, U> {
  let ownKeys: Set<U> | undefined = undefined
  function getOwnKeys() {
    if (!ownKeys) {
      ownKeys = new Set<U>()
      const inputKeys = new Set(flap(keys))
      for (const key of Reflect.ownKeys(obj)) {
        if (!inputKeys.has(key as any)) {
          ownKeys.add(key as U)
        }
      }
    }
    return ownKeys
  }
  return new Proxy(
    {},
    {
      get: (target, key, receiver) => (getOwnKeys().has(key as any) ? Reflect.get(obj, key, receiver) : undefined),
      has: (target, key) => getOwnKeys().has(key as any),
      set: (target, key, value) => Reflect.set(obj, key, value),
      getPrototypeOf: (target) => Object.getPrototypeOf(obj),
      // @ts-expect-error ts check weakpoints
      ownKeys: (target) => Array.from(getOwnKeys()),
      // for Object.keys to filter
      getOwnPropertyDescriptor: (target, prop) => ({
        ...Object.getOwnPropertyDescriptor(obj, prop),
        enumerable: true,
        configurable: true
      })
    }
  ) as T
}
function minusArray<T, U>(arr: T[], arr2: U[]): T[] {
  const arr2Set = new Set(arr2)
  return arr.filter((item) => !arr2Set.has(item as any))
}
