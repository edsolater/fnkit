import { isMap } from "../dataType"
import { type MayArray, arrify } from "../mayArray"
import type { AnyObj } from "../typings"

/**
 * like typescript Pick
 * for object/map has key. (mainly object and map)
 * @example
 * console.log(pick({ a: 1, b: true }, ['a'])) //=> { a: 1 }
 */
export function pick<T extends AnyObj, U extends keyof T>(collection: T, propNameList: MayArray<U>): Pick<T, U>
export function pick<K, V>(collection: Map<K, V>, propNameList: MayArray<K>): Map<K, V>
export function pick<T extends AnyObj | Map<any, any>>(collection: T, propNameList: MayArray<any>): any {
  return isMap(collection) ? pickMap(collection, propNameList) : pickObject(collection, propNameList)
}
function pickMap<T extends Map<any, any>>(map: T, keys: MayArray<any>): T {
  const newMap = new Map()
  for (const key of arrify(keys)) {
    if (map.has(key)) {
      newMap.set(key, map.get(key))
    }
  }
  return newMap as T
}
function pickObject<T extends AnyObj, U extends keyof T>(obj: T, keys: MayArray<U>): Pick<T, U> {
  let ownKeys: Set<U> | undefined = undefined
  function getOwnKeys() {
    if (!ownKeys) {
      const originalKeys = new Set(Reflect.ownKeys(obj))
      ownKeys = new Set<U>()
      for (const k of arrify(keys)) {
        if (originalKeys.has(k as any)) {
          ownKeys.add(k as U)
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
        configurable: true,
      }),
    },
  ) as T
}
