import { isFunction, isObjectLike, isPromise } from "../dataType"
import { AnyFn, MayPromise, type IDNumber } from "../typings"
import { shrinkFn } from "../wrapper"

const subscribableTag = Symbol("subscribable")

let subscribableId = 0
function genSubscribableId() {
  return subscribableId++
}

export type SubscribeFn<T> = (value: T, prevValue: T | undefined) => void

export interface Subscribable<T> {
  id: IDNumber
  // when set this, means this object is a subscribable
  [subscribableTag]: boolean

  (): T
  subscribe: (
    cb: SubscribeFn<NonNullable<T>>,
    options?: {
      /** if multi same key subscribeFns are registed, only last one will work  */
      key?: string
    },
  ) => { isWorking: () => boolean; unsubscribe(): void }
  /** set inner value */
  set(dispatcher: SubscribableSetValueDispatcher<T>): void
  /** return new subscribable base on this subscribable */
  pipe: <R>(fn: (value: T) => R) => Subscribable<R>
  /** unsubscribe if it subscribe from others */
  destroy(): void
  onDestory(cb: AnyFn): void
  [Symbol.dispose](): void
}

type SubscribeFnKey = string
type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(defaultValue: T | (() => T), options?: {}): Subscribable<T>
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  options?: {},
): Subscribable<T | undefined>
export function createSubscribable<T>(defaultValue?: T | (() => T), options?: {}): Subscribable<T | undefined> {
  const subscribeFnsKeylessStore = new Set<SubscribeFn<T>>()
  const subscribeFnsKeyedStore = new Map<SubscribeFnKey, SubscribeFn<T>>()
  const cleanFnsStore = new WeakMap<SubscribeFn<T>, AnyFn>()
  const onDestoryCallback = new Set<AnyFn>()

  let innerValue = shrinkFn(defaultValue) as T | undefined

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (isPromise(newValue)) {
      newValue.then((newValue) => {
        if (innerValue !== newValue) {
          const oldValue = innerValue
          innerValue = newValue // update holded data
          subscribeFnsKeyedStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
          subscribeFnsKeylessStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
        }
      })
    } else {
      if (innerValue !== newValue) {
        const oldValue = innerValue
        innerValue = newValue // update holded data
        subscribeFnsKeyedStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
        subscribeFnsKeylessStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
      }
    }
  }

  function invokeSubscribedCallbacks(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    const oldCleanFn = cleanFnsStore.get(cb)
    if (oldCleanFn) {
      oldCleanFn(innerValue)
      cleanFnsStore.delete(cb)
    }
    const cleanFn = cb(newValue as T /*  type force */, prevValue)
    if (isFunction(cleanFn)) cleanFnsStore.set(cb, cleanFn)
  }

  function subscribe(cb: any, options?: { key?: string }) {
    // immediately invoke callback, if has value
    if (innerValue != null) invokeSubscribedCallbacks(cb, innerValue, undefined)
    if (options?.key) {
      subscribeFnsKeyedStore.set(options.key, cb)
    } else {
      subscribeFnsKeylessStore.add(cb)
    }
    return {
      isWorking() {
        if (options?.key) {
          return subscribeFnsKeyedStore.get(options.key) === cb
        } else {
          return subscribeFnsKeylessStore.has(cb)
        }
      },
      unsubscribe() {
        if (options?.key) {
          subscribeFnsKeyedStore.delete(options.key)
        } else {
          subscribeFnsKeylessStore.delete(cb)
        }
        cleanFnsStore.delete(cb)
      },
    }
  }

  function pipe(fn: AnyFn) {
    const newSubscribable = createSubscribable(fn(innerValue))
    const subscribeFn = (extendedSubscribableValue: unknown) => newSubscribable.set(fn(extendedSubscribableValue))
    const { unsubscribe } = subscribe(subscribeFn)
    newSubscribable.onDestory(unsubscribe)
    onDestoryCallback.add(unsubscribe)
    return newSubscribable
  }

  function destroy() {
    subscribeFnsKeyedStore.clear()
    subscribeFnsKeylessStore.clear()
    onDestoryCallback.forEach((cb) => cb())
    onDestoryCallback.clear()
  }
  function onDestory(cb: AnyFn) {
    onDestoryCallback.add(cb)
  }

  const subscribable = Object.assign(() => innerValue, {
    [subscribableTag]: true,
    id: genSubscribableId(),
    subscribe,
    set: changeValue,
    pipe,
    destroy,
    onDestory,
    [Symbol.dispose]: destroy,
  })

  return subscribable
}

export function isSubscribable<T>(value: any): value is Subscribable<T> {
  return isObjectLike(value) && value[subscribableTag]
}

export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue: T,
): Subscribable<T>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T,
): Subscribable<T | undefined>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T | undefined,
): Subscribable<T | undefined> {
  const subscribable = createSubscribable(defaultValue)
  promise.then((v) => subscribable.set(v))
  return subscribable
}
