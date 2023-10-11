import { isFunction } from '../dataType'
import { AnyFn } from '../typings'
import { shrinkFn } from '../wrapper'
export type SubscribeFn<T> = ((value: T) => void | Promise<void>) | ((newValue: T) => void)

export type Subscribable<T> = {
  current: T
  subscribe: (cb: SubscribeFn<T>) => { unsubscribe(): void }
}

type SubscribableSetValueDispatcher<T> = T | ((oldValue: T) => T)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(
  defaultValue: T | (() => T),
  defaultCallbacks?: SubscribeFn<T>[]
): [subscribable: Subscribable<T>, setValue: (dispatcher: SubscribableSetValueDispatcher<T>) => void]
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): [
  subscribable: Subscribable<T | undefined>,
  setValue: (dispatcher: SubscribableSetValueDispatcher<T | undefined>) => void
]
export function createSubscribable<T>(
  defaultValue?: T | (() => T),
  defaultCallbacks?: SubscribeFn<T>[]
): [subscribable: Subscribable<T>, setValue: (dispatcher: SubscribableSetValueDispatcher<T | undefined>) => void] {
  const callbacks = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let innerValue = shrinkFn(defaultValue) as T

  callbacks.forEach(invokeCallback)

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (newValue != null) {
      innerValue = newValue
    }
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
      if (innerValue != null) invokeCallback(cb) // immediately invoke callback, if has value
      callbacks.add(cb)
      return {
        unsubscribe() {
          callbacks.delete(cb)
        }
      }
    }
  }

  return [subscribable, changeValue]
}

export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue: T,
  defaultCallbacks?: SubscribeFn<T>[]
): [subscribable: Subscribable<T>, setValue: (dispatcher: SubscribableSetValueDispatcher<T>) => void]
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T,
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): [
  subscribable: Subscribable<T | undefined>,
  setValue: (dispatcher: SubscribableSetValueDispatcher<T | undefined>) => void
]
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T | undefined,
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): [
  subscribable: Subscribable<T | undefined>,
  setValue: (dispatcher: SubscribableSetValueDispatcher<T | undefined>) => void
] {
  const [subscribable, setValue] = createSubscribable(defaultValue, defaultCallbacks)
  promise.then(setValue)
  return [subscribable, setValue]
}
