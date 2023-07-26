import { AnyObj, flap, isMap, MayArray } from '..'

/**
 * like typescript Pick
 * for object/map has key. (mainly object and map)
 * @example
 * console.log(pick({ a: 1, b: true }, ['a'])) //=> { a: 1 }
 */

export function pick<T extends AnyObj, U extends keyof T>(collection: T, propNameList: MayArray<U>): Pick<T, U>
export function pick<T extends Map<any, any>, U extends keyof T>(collection: T, propNameList: MayArray<U>): T
export function pick<T extends AnyObj | Map<any, any>, U extends keyof T>(
  collection: T,
  propNameList: MayArray<U>
): any {
  return isMap(collection) ? pickMap(collection, propNameList) : pickObject(collection, propNameList)
}
function pickMap<T extends Map<any, any>>(map: T, keys: MayArray<any>): T {
  const newMap = new Map(map)
  flap(keys).forEach((k) => {
    newMap.delete(k)
  })
  return newMap as T
}
function pickObject<T extends AnyObj, U extends keyof T>(obj: T, keys: MayArray<U>): Pick<T, U> {
  const newObj = Object.create(Object.getPrototypeOf(obj))
  const parsedKeys = flap(keys)
  parsedKeys.forEach((key) => {
    Object.defineProperty(newObj, key, Object.getOwnPropertyDescriptor(obj, key)!)
  })
  return newObj
}
