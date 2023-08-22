import { flap } from '.'
import { AnyObj, isMap, MayArray } from '..'

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
  const parsedKeys = minusArray(Object.getOwnPropertyNames(obj), flap(keys))
  parsedKeys.forEach((key) => {
    Object.defineProperty(newObj, key, Object.getOwnPropertyDescriptor(obj, key)!)
  })
  return newObj
}
function minusArray<T, U>(arr: T[], arr2: U[]): T[] {
  const arr2Set = new Set(arr2)
  return arr.filter((item) => !arr2Set.has(item as any))
}
