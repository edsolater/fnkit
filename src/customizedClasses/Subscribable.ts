import { flap } from "../collectionMethods"
import { isFunction, isObjectLike, isPromise } from "../dataType"
import { AnyFn, MayPromise, type IDNumber, type MayArray } from "../typings"
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
  subscribe: (cb: SubscribeFn<NonNullable<T>>) => { unsubscribe(): void }
  /** set inner value */
  set(dispatcher: SubscribableSetValueDispatcher<T>): void
  /** return new subscribable base on this subscribable */
  pipe: <R>(fn: (value: T) => R) => Subscribable<R>
  /** unsubscribe if it subscribe from others */
  destroy(): void
  [Symbol.dispose](): void
}

type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(
  defaultValue: T | (() => T),
  options?: { subscribeFns?: MayArray<SubscribeFn<T>> },
): Subscribable<T>
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  options?: { subscribeFns?: MayArray<SubscribeFn<T | undefined>> },
): Subscribable<T | undefined>
export function createSubscribable<T>(
  defaultValue?: T | (() => T),
  options?: { subscribeFns?: MayArray<SubscribeFn<T>> },
): Subscribable<T | undefined> {
  const subscribeFnsStore = new Set<SubscribeFn<T>>(options?.subscribeFns ? flap(options.subscribeFns) : undefined)
  const cleanFnsStore = new Map<SubscribeFn<T>, AnyFn>()
  const onDestoryCallback = new Set<AnyFn>()

  let innerValue = shrinkFn(defaultValue) as T | undefined

  subscribeFnsStore.forEach((cb) => invokeSubscribedCallbacks(cb, innerValue, undefined))

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (isPromise(newValue)) {
      newValue.then((newValue) => {
        if (innerValue !== newValue) {
          const oldValue = innerValue
          innerValue = newValue // update holded data
          subscribeFnsStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
        }
      })
    } else {
      if (innerValue !== newValue) {
        const oldValue = innerValue
        innerValue = newValue // update holded data
        subscribeFnsStore.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, oldValue))
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

  const subscribable = Object.assign(() => innerValue, {
    [subscribableTag]: true,
    id: genSubscribableId(),
    subscribe(cb: any) {
      if (innerValue != null) invokeSubscribedCallbacks(cb, innerValue, undefined) // immediately invoke callback, if has value
      subscribeFnsStore.add(cb)
      return {
        unsubscribe() {
          subscribeFnsStore.delete(cb)
          cleanFnsStore.delete(cb)
        },
      }
    },
    set: changeValue,
    pipe: (fn: AnyFn) => {
      const newSubscribable = createSubscribable(fn(innerValue))
      const subscribeFn = (extendedSubscribableValue: unknown) => newSubscribable.set(fn(extendedSubscribableValue))
      const { unsubscribe } = subscribable.subscribe(subscribeFn)
      onDestoryCallback.add(unsubscribe)
      return newSubscribable
    },
    destroy() {
      subscribeFnsStore.clear()
      onDestoryCallback.forEach((cb) => cb())
      onDestoryCallback.clear()
    },
    [Symbol.dispose]: () => {
      subscribable.destroy()
    },
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
