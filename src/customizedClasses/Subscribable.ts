import { isFunction } from '../dataType'
import { AnyFn } from '../typings'

type SubscribeFn<T> = (value: T | undefined) => void | Promise<void> | ((newValue: T) => void)

type Subscribable<T> = {
  current: T | undefined
  subscribe: (cb: SubscribeFn<T>) => { abort(): void }
}

type Dispatcher<T> = T | ((oldValue: T | undefined) => T)


/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 */
export function createSubscribable<T>(): [
  subscribable: Subscribable<T | undefined>,
  setValue: (dispatcher: Dispatcher<T | undefined>) => void
]
export function createSubscribable<T>(
  defaultValue: T,
  defaultCallbacks?: SubscribeFn<T>[]
): [subscribable: Subscribable<T>, setValue: (dispatcher: Dispatcher<T>) => void]
export function createSubscribable<T>(
  defaultValue?: T,
  defaultCallbacks?: SubscribeFn<T>[]
): [subscribable: Subscribable<T>, setValue: (dispatcher: Dispatcher<T>) => void] {
  const callbacks = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let innerValue = defaultValue
  callbacks.forEach(invokeCallback)

  function changeValue(dispatcher: Dispatcher<T>) {
    innerValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    callbacks.forEach(invokeCallback)
  }

  function invokeCallback(cb: SubscribeFn<T>) {
    const oldCleanFn = cleanFnMap.get(cb)
    if (isFunction(oldCleanFn)) oldCleanFn(innerValue)
    const cleanFn = cb(innerValue)
    if (isFunction(cleanFn)) cleanFnMap.set(cb, cleanFn)
  }

  const subscribable = {
    get current() {
      return innerValue
    },
    subscribe(cb: any) {
      invokeCallback(cb) // immediately invoke callback
      callbacks.add(cb)
      return {
        abort() {
          callbacks.delete(cb)
        }
      }
    }
  }

  return [subscribable, changeValue]
}
