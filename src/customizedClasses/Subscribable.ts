import { pluginCoreSymbol } from "@edsolater/pivkit"
import { isFunction, isObjectLike, isPromise } from "../dataType"
import { mergeFunction } from "../mergeFunctions"
import { AnyFn, MayPromise, type IDNumber } from "../typings"
import { shrinkFn } from "../wrapper"

const subscribableTag = Symbol("subscribable")

let subscribableId = 0
function genSubscribableId() {
  return subscribableId++
}

export type SubscribeFn<T> = ((value: T, prevValue: T | undefined, detailUtils: { setCount: number }) => void) & {
  once?: boolean
}

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

export type SubscribeFnKey = string
export type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)
// a shadow type
export type SubscribablePlugin<T> = (
  inputOptions: Pick<SubscribableOptions<T>, "name">,
) => Omit<SubscribableOptions<T>, "plugins">

/**
 *
 * @param pluginFn for better type hinting
 * @returns
 */
export function createSubscribablePlugin<T>(pluginFn: SubscribablePlugin<T>) {
  return pluginFn
}

export type SubscribableOptions<T> = {
  /** will be {@link Subscribable}'s name */
  name?: string
  /** it triggered before `onSet`, give chance to change the input value */
  beforeValueSet?: (inputRawValue: T, currentInnerValue: T, utils: { self: Promise<Subscribable<T>> }) => T
  /** same as `.subscribe() */
  onSet?: (value: T, prevValue: T, utils: { self: Promise<Subscribable<T>> }) => void
  /**
   * same as default value (function version), but this is more clear for side-effect
   */
  onInit?: (utils: { set: Subscribable<T>["set"]; self: Promise<Subscribable<T>> }) => void
  plugins?: SubscribablePlugin<any>[]
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
  const plugins = rawOptions?.plugins?.map((p) => p({ name: rawOptions.name }))
  const options = rawOptions?.plugins
    ? ({
        name: rawOptions.name,
        beforeValueSet:
          rawOptions.beforeValueSet || plugins?.some((p) => p.onInit)
            ? (...params) => {
                let result: any
                if (plugins?.some((p) => p.beforeValueSet)) {
                  plugins?.forEach((p) => {
                    if (p.beforeValueSet) result = p?.beforeValueSet?.(...params)
                  })
                }
                if (rawOptions.beforeValueSet) result = rawOptions.beforeValueSet?.(...params)
                return result
              }
            : undefined,
        onInit:
          rawOptions.onInit || plugins?.some((p) => p.onInit)
            ? (...params) => {
                rawOptions.onInit?.(...params)
                plugins?.forEach((p) => p?.onInit?.(...params))
              }
            : undefined,
        onSet:
          rawOptions.onSet || plugins?.some((p) => p.onSet)
            ? (...params) => {
                rawOptions.onSet?.(...params)
                plugins?.forEach((p) => p?.onSet?.(...params))
              }
            : undefined,
      } as SubscribableOptions<T | undefined>)
    : rawOptions
  const subscribeFnsKeylessStore = new Set<SubscribeFn<T>>()
  const subscribeFnsKeyedStore = new Map<SubscribeFnKey, SubscribeFn<T>>()
  const cleanFnsStore = new WeakMap<SubscribeFn<T>, AnyFn>()
  const onDestoryCallback = new Set<AnyFn>()

  // let innerValueUpdateTimeStamp: number // performance.now()
  let innerValue = shrinkFn(defaultValue) as T | undefined

  // run init action
  Promise.resolve().then(() => options?.onInit?.({ set: setValue, self: Promise.resolve().then(() => subscribable) }))

  function setValue(
    dispatcher: SubscribableSetValueDispatcher<T | undefined>,
    setOptions?: {
      /** even input same value, will invoke all subscribe callbacks */
      force?: boolean
    },
  ) {
    function coreOfSetValue(newInputValue: T | undefined) {
      const value = options?.beforeValueSet
        ? options.beforeValueSet(newInputValue, innerValue, {
            self: Promise.resolve().then(() => subscribable),
          })
        : newInputValue
      if (shouldInvokeValue(newInputValue, innerValue)) {
        const oldValue = innerValue
        innerValue = value // update holded data
        options?.onSet?.(value, oldValue, { self: Promise.resolve().then(() => subscribable) })
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

  let setCountCounter = 0
  function invokeSubscribedCallback(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    runCleanFn(cb)
    const cleanFn = cb(newValue as T /*  type force */, prevValue, { setCount: ++setCountCounter })
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
