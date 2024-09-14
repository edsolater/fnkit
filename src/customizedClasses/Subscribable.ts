import { isFunction, isObjectLike, isPromise } from "../dataType"
import { mergeFunction } from "../mergeFunctions"
import { AnyFn, MayPromise, type IDNumber } from "../typings"
import { shrinkFn } from "../wrapper"

const subscribableTag = Symbol("subscribable")

let subscribableId = 0
function genSubscribableId() {
  return subscribableId++
}

export type SubscribeFn<T> = ((value: T, prevValue: T | undefined) => void) & { once?: boolean }

export interface Subscribable<T> {
  id: IDNumber
  // when set this, means this object is a subscribable
  [subscribableTag]: boolean

  (): T

  /** will have if name is typed by user, or will be "(anonymous)" */
  name: string

  subscribe: (
    cb: SubscribeFn<NonNullable<T>>,
    options?: {
      /** if multi same key subscribeFns are registed, only last one will work  */
      key?: string
      /** when callback is invoking, this subscribe is removed */
      once?: boolean
      /**
       * @default true
       * when immediately is true, callback will be invoked immediately if subscribable has value
       */
      immediately?: boolean
    },
  ) => { isWorking: () => boolean; unsubscribe(): void }
  /** set inner value */
  set(
    dispatcher: SubscribableSetValueDispatcher<T>,
    setOptions?: {
      /** even input same value, will invoke all subscribe callbacks */
      force?: boolean
    },
  ): void
  /** return new subscribable base on this subscribable */
  pipe: <R>(fn: (value: T) => R) => Subscribable<R>
  /** unsubscribe if it subscribe from others */
  destroy(): void
  onDestory(cb: AnyFn): void
  [Symbol.dispose](): void
}

type SubscribeFnKey = string
type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)
// a shadow type
type SubscribablePlugin<T> = (s: Subscribable<T>) => Omit<SubscribableOptions<T>, "plugins">
type SubscribableOptions<T> = {
  /** will be {@link Subscribable}'s name */
  name?: string
  /** it triggered before `onSet`, give chance to change the input value */
  beforeValueSet?: (inputRawValue: T, currentInnerValue: T) => T
  /** same as `.subscribe() */
  onSet?: (value: T, prevValue: T) => void
  /**
   * same as default value (function version), but this is more clear for side-effect
   */
  onInit?: (utils: { set: Subscribable<T>["set"] }) => void
  plugins?: SubscribablePlugin<T>[]
}

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(defaultValue: T | (() => T), options?: SubscribableOptions<T>): Subscribable<T>
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  options?: SubscribableOptions<T | undefined>,
): Subscribable<T | undefined>
export function createSubscribable<T>(
  defaultValue?: T | (() => T),
  rawOptions?: SubscribableOptions<T | undefined>,
): Subscribable<T | undefined> {
  const options = rawOptions?.plugins
    ? ({
        name: rawOptions.name,
        beforeValueSet(...params) {
          rawOptions.beforeValueSet?.(...params)
          rawOptions.plugins?.forEach((p) => p?.(subscribable).beforeValueSet?.(...params))
        },
        onInit(...params) {
          rawOptions.onInit?.(...params)
          rawOptions.plugins?.forEach((p) => p?.(subscribable).onInit?.(...params))
        },
        onSet(...params) {
          rawOptions.onSet?.(...params)
          rawOptions.plugins?.forEach((p) => p?.(subscribable).onSet?.(...params))
        },
      } as SubscribableOptions<T | undefined>)
    : rawOptions
  const subscribeFnsKeylessStore = new Set<SubscribeFn<T>>()
  const subscribeFnsKeyedStore = new Map<SubscribeFnKey, SubscribeFn<T>>()
  const cleanFnsStore = new WeakMap<SubscribeFn<T>, AnyFn>()
  const onDestoryCallback = new Set<AnyFn>()

  // let innerValueUpdateTimeStamp: number // performance.now()
  let innerValue = shrinkFn(defaultValue) as T | undefined

  // run init action
  options?.onInit?.({ set: setValue })

  function setValue(
    dispatcher: SubscribableSetValueDispatcher<T | undefined>,
    setOptions?: {
      /** even input same value, will invoke all subscribe callbacks */
      force?: boolean
    },
  ) {
    function coreOfSetValue(newInputValue: T | undefined) {
      const value = options?.beforeValueSet ? options.beforeValueSet(newInputValue, innerValue) : newInputValue
      if (shouldInvokeValue(newInputValue, innerValue)) {
        const oldValue = innerValue
        innerValue = value // update holded data
        options?.onSet?.(value, oldValue)
        invokeSubscribedCallbacks(value, oldValue)
      }
    }

    const shouldInvokeValue = (newValue, oldValue) => oldValue !== newValue || setOptions?.force
    const newInputValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (isPromise(newInputValue)) {
      newInputValue.then((v) => {
        coreOfSetValue(v)
      })
    } else {
      coreOfSetValue(newInputValue)
    }
  }

  function invokeSubscribedCallbacks(newValue: T | undefined, prevValue: T | undefined) {
    subscribeFnsKeyedStore.forEach((cb, key) => {
      invokeSubscribedCallback(cb, newValue, prevValue)
      if (cb.once) {
        runCleanFn(cb)
        subscribeFnsKeyedStore.delete(key)
      }
    })
    subscribeFnsKeylessStore.forEach((cb) => {
      invokeSubscribedCallback(cb, newValue, prevValue)
      if (cb.once) {
        runCleanFn(cb)
        subscribeFnsKeylessStore.delete(cb)
      }
    })
  }

  function runCleanFn(cb: SubscribeFn<T>) {
    const oldCleanFn = cleanFnsStore.get(cb)
    if (oldCleanFn) {
      oldCleanFn(innerValue)
      cleanFnsStore.delete(cb)
    }
  }

  function invokeSubscribedCallback(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    runCleanFn(cb)
    const cleanFn = cb(newValue as T /*  type force */, prevValue)
    if (isFunction(cleanFn)) cleanFnsStore.set(cb, cleanFn)
  }

  function subscribe(cb: any, options?: { key?: string; once?: boolean; immediately?: boolean }) {
    const subscribeFn = options?.once ? Object.assign(cb, { once: options.once }) : cb
    // immediately invoke callback, if has value
    if ((options?.immediately ?? true) && innerValue != null)
      invokeSubscribedCallback(subscribeFn, innerValue, undefined)
    if (options?.key) {
      subscribeFnsKeyedStore.set(options.key, subscribeFn)
    } else {
      subscribeFnsKeylessStore.add(subscribeFn)
    }
    return {
      isWorking() {
        if (options?.key) {
          return subscribeFnsKeyedStore.get(options.key) === subscribeFn
        } else {
          return subscribeFnsKeylessStore.has(subscribeFn)
        }
      },
      unsubscribe() {
        if (options?.key) {
          subscribeFnsKeyedStore.delete(options.key)
        } else {
          subscribeFnsKeylessStore.delete(subscribeFn)
        }
        cleanFnsStore.delete(subscribeFn)
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
    set: setValue,
    pipe,
    destroy,
    onDestory,
    [Symbol.dispose]: destroy,
  })

  Object.defineProperty(subscribable, "name", {
    get: () => options?.name ?? "(anonymous)",
    enumerable: true,
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
