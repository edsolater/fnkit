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
  let ownKeys: Set<string> | undefined = undefined
  function getOwnKeys() {
    if (!ownKeys) {
      ownKeys = new Set<string>()
      const inputKeys = new Set(flap(keys))
      for (const key of Object.getOwnPropertyNames(obj)) {
        if (!inputKeys.has(key as any)) {
          ownKeys.add(key)
        }
      }
    }
    return ownKeys
  }
  return new Proxy(obj, {
    get(target, key, receiver) {
      return getOwnKeys().has(key as any) ? undefined : Reflect.get(target, key, receiver)
    },
    has: (target, key) => getOwnKeys().has(key as any),
    getPrototypeOf: (target) => Object.getPrototypeOf(obj),
    ownKeys: (target) => Array.from(getOwnKeys()),
    // for Object.keys to filter
    getOwnPropertyDescriptor: (target, prop) => Object.getOwnPropertyDescriptor(target, prop)
  }) as T
}
function minusArray<T, U>(arr: T[], arr2: U[]): T[] {
  const arr2Set = new Set(arr2)
  return arr.filter((item) => !arr2Set.has(item as any))
}
