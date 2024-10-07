import { isFunction } from "./dataType"
import type { AnyObj, AnyFn, Optional } from "./typings"

/**
 * Creates an observable object that allows observing method invocations,
 * property accesses, property sets, and property deletions.
 *
 * can only observe outside aync change, can't observe inside change. for example, call push() on an array will cause it's `length` change, but this action's be observe
 *
 * @param originalObj - The original object to be made observable.
 * @returns The observable object with methods to register callbacks for various events.
 *
 * @example
 * const obj = {
 *   foo: 1,
 *   bar() {
 *     console.log('bar method invoked');
 *   }
 * };
 *
 * const observableObj = proxyObject(obj);
 *
 * observableObj.onMethodInvoke('bar', () => {
 *   console.log('bar method was called');
 * });
 *
 * observableObj.onAccess('foo', (value) => {
 *   console.log('foo property was accessed, value:', value);
 * });
 *
 * observableObj.onSet((property, value) => {
 *   console.log(`${property} property was set to`, value);
 * });
 *
 * observableObj.onDelete((property) => {
 *   console.log(`${property} property was deleted`);
 * });
 *
 * observableObj.bar(); // Logs: "bar method invoked" and "bar method was called"
 * console.log(observableObj.foo); // Logs: "foo property was accessed, value: 1"
 * observableObj.foo = 2; // Logs: "foo property was set to 2"
 * delete observableObj.foo; // Logs: "foo property was deleted"
 */
export function proxyObject<O extends AnyObj>(
  originalObj: O,
  options?: {
    /**
     * will definedPropertyDescriptor for each property, so that can observe originalObj **EXISTED properties**'s get and set
     * @default true
     * TODO: imply it
     */
    alsoDefinedOriginalPropertyDescriptor: boolean
    onMethodInvoke?: Partial<{
      [K in keyof O]: (...args: Parameters<O[K] extends AnyFn ? O[K] : any>) => void
    }>
    onAccess?: Partial<{ [K in keyof O]: (value: O[K]) => void }>
    onSet?: (property: keyof O, value: O[keyof O], prevValue: O[keyof O]) => void
    onDelete?: (property: keyof O) => void
    onValueChange?: Partial<{ [K in keyof O]: (value: O[K], prevValue: O[K]) => void }>
  },
): O & {
  onMethodInvoke<K extends keyof O>(method: K, cb: (...args: Parameters<O[K] extends AnyFn ? O[K] : any>) => void): void
  /** only invoke in not methods property */
  onAccess<K extends keyof O>(property: K, cb: (value: O[K]) => void): void
  onSet<K extends keyof O>(cb: (property: K, value: O[K], prevValue: O[K]) => void): void
  onDelete(cb: (property: keyof O) => void): void

  /**
   * if property is a getter, it will never trigger this callback
   * some data change by others. for example, call push() on an array will cause it's `length` change
   */
  onValueChange<K extends keyof O>(property: K, cb: (value: O[K], prevValue: O[K]) => void): void
} {
  const registeredMethodCallbacks = new Map<keyof O, Set<(...args: Parameters<O[keyof O] & AnyFn>) => void>>()
  const registeredPropertyAccessCallbacks = new Map<keyof O, Set<(value: any) => void>>()
  const registeredPropertyValueCallbacks = new Map<keyof O, Set<(value: any, prevValue: any) => void>>()
  const registeredPropertySetCallbacks = new Set<
    (property: keyof O, value: O[keyof O], prevValue: O[keyof O]) => void
  >()
  const registeredPropertyDeleteCallbacks = new Set<(property: keyof O) => void>()

  //#region ---------------- initly register the callbacks ----------------
  if (options?.onMethodInvoke) {
    for (const [method, cb] of Object.entries(options.onMethodInvoke)) {
      registeredMethodCallbacks.set(method as any, new Set([cb as any]))
    }
  }
  if (options?.onAccess) {
    for (const [property, cb] of Object.entries(options.onAccess)) {
      registeredPropertyAccessCallbacks.set(property as any, new Set([cb as any]))
    }
  }
  if (options?.onValueChange) {
    for (const [property, cb] of Object.entries(options.onValueChange)) {
      registeredPropertyValueCallbacks.set(property as any, new Set([cb as any]))
    }
  }
  if (options?.onSet) {
    registeredPropertySetCallbacks.add(options.onSet as any)
  }
  if (options?.onDelete) {
    registeredPropertyDeleteCallbacks.add(options.onDelete as any)
  }
  //#endregion

  // //#region ---------------- define original's property descriptor ----------------
  // const definedPropertyDescriptor = options?.alsoDefinedOriginalPropertyDescriptor ?? true
  // if (definedPropertyDescriptor) {
  //   for (const key in originalObj) {
  //     const descriptor = Object.getOwnPropertyDescriptor(originalObj, key)
  //     if (descriptor) {
  //       const originalGet = descriptor.get
  //       const originalSet = descriptor.set
  //       console.log('originalSet: ', originalSet)
  //       console.log('originalGet: ', originalGet)
  //       Object.defineProperty(originalObj, key, {
  //         configurable: descriptor.configurable,
  //         enumerable: descriptor.enumerable,
  //         get() {
  //           // registeredPropertyAccessCallbacks.get(key as any)?.forEach((cb) => cb(originalObj[key as any]))
  //           return originalGet ? originalGet.call(originalObj) :(originalObj as any)[key]
  //         },
  //         set(value: any) {
  //           const prevValue = descriptor.value
  //           if (originalSet) {
  //             originalSet.call(originalObj, value)
  //           } else {
  //             ;(originalObj as any)[key] = value
  //           }
  //           // registeredPropertySetCallbacks.forEach((cb) => cb(key as any, value, prevValue))
  //           // registeredPropertyValueCallbacks.get(key as any)?.forEach((cb) => cb(value, prevValue))
  //         },
  //       })
  //     }
  //   }
  // }
  // //#endregion

  return new Proxy(
    Object.assign(originalObj, {
      onMethodInvoke<K extends keyof O>(method: K, cb: (...args: Parameters<O[K] & AnyFn>) => void): void {
        if (!registeredMethodCallbacks.has(method)) {
          registeredMethodCallbacks.set(method, new Set())
        }
        registeredMethodCallbacks.get(method)?.add(cb)
      },
      onAccess<K extends keyof O>(property: K, cb: (value: O[K]) => void): void {
        if (!registeredPropertyAccessCallbacks.has(property)) {
          registeredPropertyAccessCallbacks.set(property, new Set())
        }
        registeredPropertyAccessCallbacks.get(property)?.add(cb)
      },
      onSet<K extends keyof O>(cb: (property: K, value: O[K], prevValue: O[K]) => void): void {
        registeredPropertySetCallbacks.add(cb as any)
      },
      onDelete(cb: (property: keyof O) => void): void {
        registeredPropertyDeleteCallbacks.add(cb)
      },
      onValueChange<K extends keyof O>(property: K, cb: (value: O[K], prevValue: O[K]) => void): void {
        if (!registeredPropertyValueCallbacks.has(property)) {
          registeredPropertyValueCallbacks.set(property, new Set())
        }
        registeredPropertyValueCallbacks.get(property)?.add(cb)
      },
    }),
    {
      get(target, p, receiver) {
        const originalResult = Reflect.get(target, p, receiver)
        if (isFunction(originalResult)) {
          return (...args: any[]) => {
            const functionResult = (originalResult as AnyFn)?.(...(args as [any]))
            //@ts-ignore
            registeredMethodCallbacks.get(p as any)?.forEach((cb) => cb(...args))
            return functionResult
          }
        } else {
          registeredPropertyAccessCallbacks.get(p as any)?.forEach((cb) => cb(originalResult))
          return originalResult
        }
      },
      set(target, p, value, receiver) {
        const prevValue = Reflect.get(target, p, receiver)
        const result = Reflect.set(target, p, value, receiver)
        registeredPropertySetCallbacks.forEach((cb) => cb(p as any, value, prevValue))
        registeredPropertyValueCallbacks.get(p as any)?.forEach((cb) => cb(value, prevValue))
        return result
      },
      deleteProperty(target, p) {
        const result = Reflect.deleteProperty(target, p)
        registeredPropertyDeleteCallbacks.forEach((cb) => cb(p as any))
        return result
      },
    },
  )
}
