import { shakeNil, map } from '../collectionMethods'
import { isFunction } from '../dataType'
import { AnyFn, PickMethodKeys, PickPropertyKeys } from '../typings'

type WithOnMethods<T extends Record<any, any>> = T & {
  onChange: <P extends PickPropertyKeys<T>>(
    propertyName: P,
    cb: (newValue: T[P], oldValue: T[P]) => void
  ) => void
  on: <P extends PickMethodKeys<T>>(
    propertyName: P,
    cb: (...args: Parameters<T[P]>) => void
  ) => void
}

/**
 * **MUTABLE**
 *
 * add `on` property to monitor all property and methods
 *
 * ! it will automaticly attach setters(proxy) and getters(proxy) for object method's inner change
 *
 * @param obj if property already Start with `on`, it will be ignored
 * @example <caption>case 1:</caption>
 * const obj = onify({hello: 1})
 * obj.on('hello', (newValue)=>{console.log(newValue)})
 * obj.hello = 'hi' // hi
 * obj.setHello('hi') // hi
 *
 * @example <caption>case 2:</caption>
 * const obj = onify({setHello(name) {}})
 * obj.on('setHello', (...args)=>{console.log(args)})
 * obj.setHello('hi') // ['hi']
 */
export function onify<T extends Record<string, any>>(obj: T): WithOnMethods<T> {
  const callbackBucket: {
    [propertyName in keyof T]?: AnyFn[]
  } = {}

  // attach setters and getters for inner change
  const originObject = { ...obj }

  const props = shakeNil(
    map(obj, (v, k) =>
      isFunction(v)
        ? undefined
        : {
            set(newValue) {
              const oldValue = originObject[k]
              originObject[k] = newValue
              callbackBucket[k]?.forEach((callback) => callback(newValue, oldValue))
            },
            get() {
              return originObject[k]
            }
          }
    )
  )
  Object.defineProperties(obj, props)

  // @ts-expect-error force type
  return Object.assign(
    new Proxy(obj, {
      // assign property directly
      set(target, propertyName: string, newValue) {
        const oldValue = target[propertyName]
        const result = Reflect.set(target, propertyName, newValue)
        if (propertyName in obj) {
          callbackBucket[propertyName]?.forEach((callback) => callback(newValue, oldValue))
        }
        return result
      },
      // get object methods
      get(target, propertyName: string) {
        if (propertyName in obj && isFunction(target[propertyName])) {
          return (...args) => {
            target[propertyName]?.(...args)
            callbackBucket[propertyName]?.forEach((callback) => callback(...args))
          }
        }
        return Reflect.get(target, propertyName)
      }
    }),
    {
      on(propertyName: keyof T, callback: () => void) {
        callbackBucket[propertyName] = [...(callbackBucket[propertyName] ?? []), callback]
      },
      onChange(propertyName: keyof T, callback: () => void) {
        callbackBucket[propertyName] = [...(callbackBucket[propertyName] ?? []), callback]
      }
    }
  )
}
