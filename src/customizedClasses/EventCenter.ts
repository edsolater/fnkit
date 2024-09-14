import { uncapitalize } from "../changeCase"
import { map } from "../collectionMethods"
import { isString } from "../dataType"
import { AnyFn } from "../typings"
import { createSubscription, Subscription } from "./Subscription"

type EventConfig = {
  [eventName: string]: Parameters<AnyFn>
}

let eventCenterIdCounter = 1
function generateEventCenterId() {
  return eventCenterIdCounter++
}

type EventCenterCreateOptions<T extends EventConfig> = {
  /**
   * !important
   * remove all inner cached values or callbacks for friendly GC
   */
  destoryAfterEmit?: keyof T
  shouldCacheAllEmitedValues?: boolean
  shouldCachEmitedValue?: boolean

  whenEventListenerRegistered?: {
    [P in keyof T as `${P & string}`]?: (utils: {
      fn: (...params: T[P]) => void
      eventName: P
      emit: EventCenter<T>["emit"]
      isFirst: boolean
    }) => void
  }
  whenAnyEventListenerRegistered?: (utils: {
    fn: (...params: any[]) => void
    emit: EventCenter<T>["emit"]
    isFirst: boolean
  }) => void
}

export type EventCenterListenerOptions = {
  /**
   * worked only if `shouldCacheAllEmitedValues` is true
   */
  initWithMultiPrevEmitedValues?: boolean
  /**
   * worked only if `shouldCachEmitedValue` is true
   */
  initWithPrevEmitedValue?: boolean
}

type EventCenterOn<Config extends EventConfig> = {
  [P in keyof Config as `on${Capitalize<string & P>}`]: (
    subscriptionFn: (...params: Config[P]) => void,
    options?: EventCenterListenerOptions,
  ) => Subscription
}
type EventCenterBase<Config extends EventConfig> = {
  /** core for event provider */
  emit<EventName extends keyof Config>(eventName: EventName, parameters: Config[EventName]): void

  /**
   * same as {@link EventCenter['on']} but will regist multi listeners at once
   * @deprecated just use on
   */
  multiOn<U extends Partial<Config>>(
    subscriptionFns: U,
    options?: EventCenterListenerOptions,
  ): { [P in keyof U]: Subscription }

  /** core for event consumer */
  /**
   * create a factory
   */
  on<EventName extends keyof Config>(
    eventName: EventName,
  ): (subscriptionFn: (...params: Config[EventName]) => void, options?: EventCenterListenerOptions) => Subscription
  /**
   * subscribe
   */
  on<EventName extends keyof Config>(
    eventName: EventName,
    subscriptionFn: (...params: Config[EventName]) => void,
    options?: EventCenterListenerOptions,
  ): Subscription

  listenAnyEvent<EventName extends keyof Config>(
    subscriptionFn: (eventName: EventName, cllbackParams: Config[EventName]) => void,
    options?: EventCenterListenerOptions,
  ): Subscription

  /** clear all registed events for specified event */
  clear(): void

  /** delete registed for specified event */
  delete(eventName: keyof Config): void
}
export type EventCenter<Config extends EventConfig> = EventCenterBase<Config> &
  Omit<EventCenterOn<Config>, keyof EventCenterBase<any>>

/**
 * @example
 *
 * //step 1: regist events (3 ways)
 *  // client side
 * cc.registEvents({
 *   change({ status }) {
 *     // status is 'success' | 'error'
 *     // do something
 *   }
 * })
 *
 * cc.on('change', ({status})=>{
 *   // status is 'success' | 'error'
 * })
 *
 * cc.onChange(({ status }) => {
 *   // status is 'success' | 'error'
 * })
 *
 * //step 2: emit events
 * // server side
 * cc.emit('change', [{ status: 'success' }])
 */
// 💡 observable should be the core of js model. just like event target is the core of DOM
export function createEventCenter<T extends EventConfig>(options?: EventCenterCreateOptions<T>): EventCenter<T> {
  const _eventCenterId = generateEventCenterId()
  const anyEventCommonCallbacks = new Set<AnyFn>()
  const storedCallbackStore = new Map<keyof T, Set<AnyFn>>()
  type CallbackParam = any[]

  const emitedValueCache =
    options?.shouldCacheAllEmitedValues || options?.shouldCachEmitedValue
      ? new Map<keyof T, CallbackParam[]>()
      : undefined

  const emit = ((eventName, paramters) => {
    storedCallbackStore.get(eventName)?.forEach((fn) => {
      fn.apply(undefined, paramters ?? [])
    })
    anyEventCommonCallbacks.forEach((fn) => {
      fn.apply(undefined, [eventName, paramters ?? []])
    })

    if (options?.shouldCachEmitedValue) {
      emitedValueCache!.set(eventName, (emitedValueCache!.get(eventName) ?? []).concat(paramters))
    } else if (options?.shouldCacheAllEmitedValues) {
      emitedValueCache!.set(eventName, (emitedValueCache!.get(eventName) ?? []).concat(paramters))
    }

    // destory if needed(in next frame by setTimeout)
    if (options?.destoryAfterEmit === eventName) {
      storedCallbackStore.clear()
      anyEventCommonCallbacks.clear()
      emitedValueCache?.clear()
    }
  }) as EventCenter<T>["emit"]

  function singlyOn(eventName: string, fn: AnyFn, eventListenerOptions?: EventCenterListenerOptions): Subscription {
    const callbackList = storedCallbackStore.get(eventName) ?? new Set()
    callbackList.add(fn) //NUG:  <-- add failed??
    storedCallbackStore.set(eventName, callbackList)

    // handle `whenAttached` side-effect
    options?.whenEventListenerRegistered?.[eventName]?.({
      fn,
      emit,
      eventName,
      isFirst: !storedCallbackStore.has(eventName),
    })

    if (eventListenerOptions?.initWithMultiPrevEmitedValues) {
      const cachedValues = emitedValueCache?.get(eventName)
      cachedValues?.forEach((prevParamters) => {
        fn.apply(undefined, prevParamters)
      })
    } else if (eventListenerOptions?.initWithPrevEmitedValue) {
      const values = emitedValueCache?.get(eventName)
      const prevParamters = values?.[values.length - 1]
      if (prevParamters) fn.apply(undefined, prevParamters)
    }

    return createSubscription({
      onUnsubscribe() {
        storedCallbackStore.get(eventName)?.delete(fn)
      },
    })
  }
  function listenWhateverEvent<EventName extends keyof T>(
    fn: (eventName: EventName, cllbackParams: T[EventName]) => void,
    eventListenerOptions?: EventCenterListenerOptions,
  ): Subscription {
    anyEventCommonCallbacks.add(fn)

    // handle `whenAttached` side-effect
    options?.whenAnyEventListenerRegistered?.({ fn, emit, isFirst: anyEventCommonCallbacks.size === 1 })

    if (eventListenerOptions?.initWithPrevEmitedValue) {
      emitedValueCache?.forEach((cachedValues, eventName) => {
        const prevParamters = cachedValues?.[cachedValues.length - 1]
        // @ts-ignore no need to check
        fn.apply(undefined, [eventName, prevParamters])
      })
    } else if (eventListenerOptions?.initWithMultiPrevEmitedValues) {
      emitedValueCache?.forEach((cachedValues, eventName) => {
        cachedValues?.forEach((prevParamters) => {
          // @ts-ignore no need to check
          fn.apply(undefined, [eventName, prevParamters])
        })
      })
    }

    return createSubscription({
      onUnsubscribe() {
        anyEventCommonCallbacks.delete(fn)
      },
    })
  }

  const createOnFactory = (eventName: string) => (fn: AnyFn, options?: EventCenterListenerOptions) =>
    singlyOn(eventName, fn, options)

  const on = ((...args) => {
    if (args.length === 1) {
      return createOnFactory(...(args as [string]))
    } else {
      return singlyOn(...(args as [string, AnyFn, EventCenterListenerOptions]))
    }
  }) as EventCenter<T>["on"]

  const multiOn = ((subscriptionFns, options) =>
    map(
      subscriptionFns,
      (handlerFn, eventName) => handlerFn && singlyOn(String(eventName), handlerFn as AnyFn, options),
    )) as EventCenter<T>["multiOn"]

  function clear() {
    storedCallbackStore.clear()
  }
  function deleteCallback(eventName: keyof T) {
    storedCallbackStore.delete(eventName)
  }

  const eventCenterBase = {
    listenAnyEvent: listenWhateverEvent,
    multiOn,
    on,
    emit,
    clear,
    delete: deleteCallback,
    _eventCenterId,
  } as EventCenterBase<T>
  const eventCenter = new Proxy(eventCenterBase, {
    get(target, p, receiver) {
      if (p in target) return Reflect.get(target, p, receiver)
      if (isString(p) && p.startsWith("on") && p.length > 2) {
        const eventName = uncapitalize(p.slice(2))
        return createOnFactory(eventName)
      }
      return undefined
    },
  }) as EventCenter<T>

  return eventCenter
}

// export function mergeEventCenterFeature<O extends object, T extends EventConfig>(

//   targetObject: O,
//   eventCenter: EventCenter<T>
// ): O & EventCenter<T> {
//   const merged = new Proxy(targetObject, {
//     get(target, p) {
//       if (p in targetObject) return target[p]
//       return eventCenter[p]
//     }
//   }) as O & EventCenter<T>
//   return merged
// }
