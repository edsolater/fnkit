import { AnyArr } from "../typings"

/**
 * proxy for only calc used info not all
 */
export function proxyFilter<T extends AnyArr>(
  array: T,
  preficate: (item: T[number], index: number, arr: T) => unknown,
): T {
  let resultArray: NonNullable<T>[] | undefined = undefined
  return new Proxy(array, {
    get(target, prop, receiver) {
      if (prop === Symbol.iterator) {
        return function* () {
          resultArray ??= []
          for (let i = 0; i < target.length; i++) {
            const item = target[i]
            if (preficate(item, i, target)) {
              resultArray.push(item)
              yield item
            }
          }
        }
      } else {
        if (resultArray === undefined) {
          resultArray ??= []
          for (let i = 0; i < target.length; i++) {
            const item = target[i]
            if (preficate(item, i, target)) {
              resultArray.push(item as NonNullable<T>)
            }
          }
        }
        return Reflect.get(resultArray, prop, receiver)
      }
    },
  })
}
