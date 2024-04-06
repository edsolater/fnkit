import { WeakerMap } from "./customizedClasses"
import { isObjectLike } from "./dataType"
import type { Primitive } from "./typings"

type Key = Primitive
type ArrayHash = `__hash__${number}`
/**
 * like JavaScript Map , but use shallow compare
 * @todo the shallow compare is 2 level, not elegant
 *
 */
export function createShallowMap<InputKey extends object | { [key: string]: unknown }, ReturnedValue>({
  shallowCompare = true,
}: {
  shallowCompare?: boolean
} = {}) {
  let hashNumberStamp = 0

  const objectHashMap = new WeakerMap<object, ArrayHash>()

  // this will be used only if use shallow compare (this can be set in options)
  const objectHashMap__inner = new WeakerMap<object, ArrayHash>()

  // compute idle key for parameters in an invoke.
  const calcKey = (input: unknown, valueMap = objectHashMap, canGoDeep = true): Key =>
    isObjectLike(input)
      ? Object.entries(input)
          .map(([key, val]) => {
            if (typeof val !== "object" || val === null) return `${key}${val}`
            if (valueMap.has(val)) return valueMap.get(val)
            if (shallowCompare && canGoDeep) {
              const innerKey = calcKey(val, objectHashMap__inner, false)
              return `${key}${String(innerKey)}`
            }
            valueMap.set(val, `__hash__${++hashNumberStamp}` as const)
          })
          .join(" ")
      : (input as Primitive)

  const returnedValueMap = new Map<Key, ReturnedValue>()

  return {
    set(arrayKey: InputKey, value: ReturnedValue) {
      const keyString = calcKey(arrayKey)
      return returnedValueMap.set(keyString, value)
    },
    get(arrayKey: InputKey) {
      const keyString = calcKey(arrayKey)
      return returnedValueMap.get(keyString)
    },
    has(arrayKey: InputKey) {
      const keyString = calcKey(arrayKey)
      return returnedValueMap.has(keyString)
    },
  }
}
