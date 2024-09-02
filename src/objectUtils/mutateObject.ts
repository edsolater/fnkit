import type { AnyFn } from "../typings"

/** will create a new proxy obj,  */
export function changeObjectValue(
  obj: object,
  mutateFn: (payload: { originalValue: any; key: keyof any }) => any,
): object {
  let keys: Set<string | symbol> | undefined = undefined
  let keysArray: (string | symbol)[] | undefined = undefined

  function getOwnKeys() {
    if (!keys || !keysArray) {
      keysArray = Reflect.ownKeys(obj)
      keys = new Set(keysArray)
    }
    return { a: keysArray, s: keys }
  }
  return new Proxy(obj, {
    apply(target, thisArg, argArray) {
      const fn = target
      return fn && Reflect.apply(fn as AnyFn, thisArg, argArray)
    },
    get: (target, key) => {
      const value = target[key]
      const v = mutateFn({ originalValue: value, key })
      return v
    },
    set: (_target, key, value) => Reflect.set(_target, key, value),
    has: (_target, key) => getOwnKeys().s.has(key),
    getPrototypeOf: (target) => Object.getPrototypeOf(target),
    ownKeys: () => getOwnKeys().a,
    // for Object.keys to filter
    getOwnPropertyDescriptor: (target, p) => Reflect.getOwnPropertyDescriptor(target, p),
  })
}
