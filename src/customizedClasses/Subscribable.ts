import { isFunction, isPromise } from '../dataType'
import { AnyFn, MayPromise } from '../typings'
import { shrinkFn } from '../wrapper'

const subscribableTag = Symbol('subscribable')

export type SubscribeFn<T> = (value: T, prevValue: T | undefined) => void
export interface Subscribable<T> {
  // when set this, means this object is a subscribable
  [subscribableTag]: boolean

  (): T
  subscribe: (cb: SubscribeFn<NonNullable<T>>) => { unsubscribe(): void }
  /** can not export this property by type */
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
  const subscribeFns = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let innerValue = shrinkFn(defaultValue) as T | undefined

  subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, innerValue, undefined))

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (isPromise(newValue)) {
      newValue.then((newValue) => {
        if (innerValue !== newValue) {
          const oldValue = innerValue
          innerValue = newValue // update holded data
          subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
        }
      })
    } else {
      if (innerValue !== newValue) {
        const oldValue = innerValue
        innerValue = newValue // update holded data
        subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
      }
    }
  }

  function invokeSubscribedCallbacks(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    const oldCleanFn = cleanFnMap.get(cb)
    if (isFunction(oldCleanFn)) oldCleanFn(innerValue)
    const cleanFn = cb(newValue as T /*  type force */, prevValue)
    if (isFunction(cleanFn)) cleanFnMap.set(cb, cleanFn)
  }

  const subscribable = Object.assign(() => innerValue, {
    [subscribableTag]: true,
    subscribe(cb: any) {
      if (innerValue != null) invokeSubscribedCallbacks(cb, innerValue, undefined) // immediately invoke callback, if has value
      subscribeFns.add(cb)
      return {
        unsubscribe() {
          subscribeFns.delete(cb)
        }
      }
    },
    set: changeValue
  })
  return subscribable
}

export function isSubscribable<T>(value: any): value is Subscribable<T> {
  return value && value[subscribableTag]
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
