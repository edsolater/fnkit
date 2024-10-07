import { isFunction } from "./dataType"
import type { AnyObj, AnyFn } from "./typings"

/**
 * Creates an observable object that allows observing method invocations,
 * property accesses, property sets, and property deletions.
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
 * const observableObj = createObservableObj(obj);
 *
 * observableObj.observeMethodInvoke('bar', () => {
 *   console.log('bar method was called');
 * });
 *
 * observableObj.observePropertyAccess('foo', (value) => {
 *   console.log('foo property was accessed, value:', value);
 * });
 *
 * observableObj.observePropertySet((property, value) => {
 *   console.log(`${property} property was set to`, value);
 * });
 *
 * observableObj.observePropertyDelete((property) => {
 *   console.log(`${property} property was deleted`);
 * });
 *
 * observableObj.bar(); // Logs: "bar method invoked" and "bar method was called"
 * console.log(observableObj.foo); // Logs: "foo property was accessed, value: 1"
 * observableObj.foo = 2; // Logs: "foo property was set to 2"
 * delete observableObj.foo; // Logs: "foo property was deleted"
 */
export function createObservableObj<O extends AnyObj>(
  originalObj: O,
): O & {
  observeMethodInvoke<K extends keyof O>(
    method: K,
    cb: (...args: Parameters<O[K] extends AnyFn ? O[K] : any>) => void,
  ): void
  /** only invoke in not methods property */
  observePropertyAccess<K extends keyof O>(property: K, cb: (value: O[K]) => void): void
  observePropertySet<K extends keyof O>(cb: (property: K, value: O[K]) => void): void
  observePropertyDelete(cb: (property: keyof O) => void): void
} {
  const registeredMethodCallbacks = new Map<keyof O, Set<(...args: Parameters<O[keyof O] & AnyFn>) => void>>()
  const registeredPropertyAccessCallbacks = new Map<keyof O, Set<(value: any) => void>>()

  const registeredPropertySetCallbacks = new Set<
    (property: keyof O, value: O[keyof O], prevValue: O[keyof O]) => void
  >()
  const registeredPropertyDeleteCallbacks = new Set<(property: keyof O) => void>()

  return new Proxy(
    Object.assign(originalObj, {
      observeMethodInvoke<K extends keyof O>(method: K, cb: (...args: Parameters<O[K] & AnyFn>) => void): void {
        if (!registeredMethodCallbacks.has(method)) {
          registeredMethodCallbacks.set(method, new Set())
        }
        registeredMethodCallbacks.get(method)?.add(cb)
      },
      observePropertyAccess<K extends keyof O>(property: K, cb: (value: O[K]) => void): void {
        if (!registeredPropertyAccessCallbacks.has(property)) {
          registeredPropertyAccessCallbacks.set(property, new Set())
        }
        registeredPropertyAccessCallbacks.get(property)?.add(cb)
      },
      observePropertySet<K extends keyof O>(cb: (property: K, value: O[K], prevValue: O[K]) => void): void {
        registeredPropertySetCallbacks.add(cb as any)
      },
      observePropertyDelete(cb: (property: keyof O) => void): void {
        registeredPropertyDeleteCallbacks.add(cb)
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
