import { WeakerMap } from './customizedClasses'
import { isObjectLike } from './dataType'

// COUNT：使用次数 1
type Key = string
type ArrayHash = `__map_value_hash__${number}`

/**
 * like JavaScript Map , but use shallow compare
 * @todo the shallow compare is 2 level, not elegant
 *
 */
function createShallowMap<InputKey extends object | { [key: string]: unknown }, ReturnedValue>(
  options: {
    shallowCompare?: boolean
  } = {}
) {
  Object.assign(options, { shallowCompare: true } as Parameters<typeof createShallowMap>[0], options)

  let hashNumberStamp = 0

  const objectHashMap = new WeakerMap<object, ArrayHash>()

  // this will be used only if use shallow compare (this can be set in options)
  const objectHashMap__inner = new WeakerMap<object, ArrayHash>()

  // compute idle key for parameters in an invoke.
  const calcKey = (input: unknown, valueMap = objectHashMap, canGoDeep = true): Key =>
    isObjectLike(input)
      ? Object.entries(input)
          .map(([key, val]) => {
            if (typeof val !== 'object' || val === null) return `${key}${val}`
            if (valueMap.has(val)) return valueMap.get(val)
            if (options.shallowCompare && canGoDeep) {
              const innerKey = calcKey(val, objectHashMap__inner, false)
              return `${key}${innerKey}`
            }
            valueMap.set(val, `__map_value_hash__${++hashNumberStamp}` as const)
          })
          .join(' ')
      : String(input)

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
    }
  }
}
/**
 * 让函数自带缓存功能，
 */
type AnyFunction = (...args: any[]) => void
type CachedFunction<F extends AnyFunction> = F

export function cache<F extends AnyFunction>(originalFn: F): CachedFunction<F> {
  const cache = createShallowMap<Parameters<F>, ReturnType<F>>()
  //@ts-expect-error
  return (...args: Parameters<F>) => {
    if (cache.has(args)) return cache.get(args)
    else {
      //@ts-expect-error
      const returnedValue: ReturnType<F> = originalFn(...args)
      cache.set(args, returnedValue)
      return returnedValue
    }
  }
}
