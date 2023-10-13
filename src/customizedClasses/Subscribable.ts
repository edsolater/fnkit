import { isPromise } from 'util/types'
import { isFunction } from '../dataType'
import { AnyFn, MayPromise } from '../typings'
import { shrinkFn } from '../wrapper'
export type SubscribeFn<T> = ((value: T) => void | Promise<void>) | ((newValue: T, prevValue: T | undefined) => void)

export type Subscribable<T> = {
  current: T
  value: () => T
  subscribe: (cb: SubscribeFn<T>) => { unsubscribe(): void }
  set(dispatcher: SubscribableSetValueDispatcher<T>): void
}

type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(defaultValue: T | (() => T), defaultCallbacks?: SubscribeFn<T>[]): Subscribable<T>
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): Subscribable<T | undefined>
export function createSubscribable<T>(
  defaultValue?: T | (() => T),
  defaultCallbacks?: SubscribeFn<T>[]
): Subscribable<T | undefined> {
  const callbacks = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let innerValue = shrinkFn(defaultValue) as T

  callbacks.forEach((cb) => invokeCallback(cb, innerValue, undefined))

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (isPromise(newValue)) {
      newValue.then((value) => {
        callbacks.forEach((cb) => invokeCallback(cb, value, innerValue))
        if (value != null) {
          innerValue = value
        }
      })
    } else {
      callbacks.forEach((cb) => invokeCallback(cb, newValue, innerValue))
      if (newValue != null) {
        innerValue = newValue
      }
    }
  }

  function invokeCallback(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    const oldCleanFn = cleanFnMap.get(cb)
    if (isFunction(oldCleanFn)) oldCleanFn(innerValue)
    const cleanFn = cb(newValue as T /*  type force */, prevValue)
    if (isFunction(cleanFn)) cleanFnMap.set(cb, cleanFn)
  }

  const subscribable = {
    /** not clear for subscribable
     * @deprecated use `subscribable.value()` instead
     */
    get current() {
      return innerValue
    },
    value() {
      return innerValue
    },
    subscribe(cb: any) {
      if (innerValue != null) invokeCallback(cb, innerValue, undefined) // immediately invoke callback, if has value
      callbacks.add(cb)
      return {
        unsubscribe() {
          callbacks.delete(cb)
        }
      }
    },
    set: changeValue
  }

  return subscribable
}

export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue: T,
  defaultCallbacks?: SubscribeFn<T>[]
): Subscribable<T>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T,
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): Subscribable<T | undefined>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T | undefined,
  defaultCallbacks?: SubscribeFn<T | undefined>[]
): Subscribable<T | undefined> {
  const subscribable = createSubscribable(defaultValue, defaultCallbacks)
  promise.then((v) => subscribable.set(v))
  return subscribable
}
