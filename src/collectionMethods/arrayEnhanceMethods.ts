import { Collection, flap, GetCollectionKey } from '.'
import { AnyObj, isMap, MayArray } from '..'
import { getEntryKey, toEntries } from './entries'
import filter from './filter'

/**
 * like typescript Omit
 * for object/map has key. (mainly object and map)
 * @example
 * console.log(omit({ a: 1, b: true }, ['a'])) //=> { b: true }
 */
export function omit<T extends AnyObj, U extends keyof T>(collection: T, propNameList: MayArray<U>): Omit<T, U>
export function omit<T extends Map<any, any>, U extends keyof T>(collection: T, propNameList: MayArray<U>): T
export function omit<T extends AnyObj | Map<any, any>, U extends keyof T>(
  collection: T,
  propNameList: MayArray<U>
): any {
  return isMap(collection) ? omitMap(collection, propNameList) : omitObject(collection, propNameList)
}

function omitMap<T extends Map<any, any>>(map: T, keys: MayArray<any>): T {
  const newMap = new Map(map)
  flap(keys).forEach((k) => {
    newMap.delete(k)
  })
  return newMap as T
}

function omitObject<T extends AnyObj, U extends keyof T>(obj: T, keys: MayArray<U>): Omit<T, U> {
  const newObj = Object.create(Object.getPrototypeOf(obj))
  const parsedKeys = arrayMinus(Object.keys(obj), flap(keys))
  parsedKeys.forEach((key) => {
    Object.defineProperty(newObj, key, Object.getOwnPropertyDescriptor(obj, key)!)
  })
  return newObj
}

function arrayMinus<T, U>(arr: T[], arr2: U[]): T[] {
  const arr2Set = new Set(arr2)
  return arr.filter((item) => !arr2Set.has(item as any))
}

/**
 * like typescript Pick.
 *  for collection that has key. (mainly object and map)
 * @requires {@link filter `filter()`}
 * @example
 * pick({ a: 1, b: 2 }, ['a']) // { a: 1 }
 */
export function pick<T extends Collection, U extends keyof T>(collection: T, propNameList: U[]): Pick<T, U> {
  return filter(collection, (_value, key) => propNameList.includes(key as any)) as unknown as Pick<T, U>
}

export function getKeys<T extends Collection>(collection: T): GetCollectionKey<T>[] {
  const entries = [...toEntries(collection)]
  return entries.map((entry) => getEntryKey(entry))
}
