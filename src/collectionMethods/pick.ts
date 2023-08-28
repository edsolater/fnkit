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
  for (const key of flap(keys)) {
    newMap.delete(key)
  }
  return newMap as T
}
function pickObject<T extends AnyObj, U extends keyof T>(obj: T, keys: MayArray<U>): Pick<T, U> {
  let ownKeys: U[] | undefined = undefined
  function getOwnKeys(): U[] {
    if (!ownKeys) {
      const originalKeys = new Set(Object.getOwnPropertyNames(obj))
      ownKeys = []
      for (const k of flap(keys)) {
        if (originalKeys.has(k as any)) {
          ownKeys.push(k as U)
        }
      }
    }
    return ownKeys
  }
  return new Proxy(obj, {
    get(target, key, receiver) {
      return getOwnKeys().includes(key as any) ? undefined : Reflect.get(target, key, receiver)
    },
    has: (target, key) => getOwnKeys().includes(key as any),
    getPrototypeOf: (target) => Object.getPrototypeOf(obj),
    //@ts-expect-error ts check weakpoints
    ownKeys: (target) => getOwnKeys(),
    // for Object.keys to filter
    getOwnPropertyDescriptor: (target, prop) => Object.getOwnPropertyDescriptor(target, prop)
  }) as T
}
