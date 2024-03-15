import { map } from "../collectionMethods"
import { AnyFn } from "../typings"
import { createSubscription, Subscription } from "./Subscription"

type EventConfig = {
  [eventName: string]: AnyFn
}

let eventCenterIdCounter = 1
function generateEventCenterId() {
  return eventCenterIdCounter++
}

type EventCenterCreateOptions<T extends EventConfig> = {
  shouldCacheAllEmitedValues?: boolean
  shouldCachEmitedValue?: boolean

  whenEventListenerRegistered?: {
    [P in keyof T as `${P & string}`]?: (utils: {
      fn: (...params: Parameters<T[P]>) => void
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
export type EventListenerOptions = {
  /**
   * worked only if `shouldCacheAllEmitedValues` is true
   */
  initWithMultiPrevEmitedValues?: boolean
  /**
   * worked only if `shouldCachEmitedValue` is true
   */
  initWithPrevEmitedValue?: boolean
}

export type EventCenter<Config extends EventConfig> = {
  /** core for event provider */
  emit<EventName extends keyof Config>(eventName: EventName, parameters: Parameters<Config[EventName]>): void

  /**
   * same as {@link EventCenter['on']} but will regist multi listeners at once
   * @deprecated just use on
   */
  registEventHandlers<U extends Partial<Config>>(
    subscriptionFns: U,
    options?: EventListenerOptions,
  ): { [P in keyof U]: Subscription }

  /** core for event consumer */
  /**
   * create a factory
   */
  on<EventName extends keyof Config>(
    eventName: EventName,
  ): (
    subscriptionFn: (...params: Parameters<Config[EventName]>) => void,
    options?: EventListenerOptions,
  ) => Subscription
  /**
   * subscribe
   */
  on<EventName extends keyof Config>(
    eventName: EventName,
    subscriptionFn: (...params: Parameters<Config[EventName]>) => void,
    options?: EventListenerOptions,
  ): Subscription

  onAnyEvent<EventName extends keyof Config>(
    subscriptionFn: (eventName: EventName, cllbackParams: Parameters<Config[EventName]>) => void,
    options?: EventListenerOptions,
  ): Subscription

  /** clear all registed events for specified event */
  clearAll(): void

  /** clear registed for specified event */
  clear(eventName: keyof Config): void
}

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
  }) as EventCenter<T>["emit"]

  function singlyOn(eventName: string, fn: AnyFn, eventListenerOptions?: EventListenerOptions): Subscription {
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
  function onAnyEvent<EventName extends keyof T>(
    fn: (eventName: EventName, cllbackParams: Parameters<T[EventName]>) => void,
    eventListenerOptions?: EventListenerOptions,
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

  const createOnFactory = (eventName: string) => (fn: AnyFn, options?: EventListenerOptions) =>
    singlyOn(eventName, fn, options)

  const on = ((...args) => {
    if (args.length === 1) {
      return createOnFactory(...(args as [string]))
    } else {
      return singlyOn(...(args as [string, AnyFn, EventListenerOptions]))
    }
  }) as EventCenter<T>["on"]

  const registEvents = ((subscriptionFns, options) =>
    map(
      subscriptionFns,
      (handlerFn, eventName) => handlerFn && singlyOn(String(eventName), handlerFn as AnyFn, options),
    )) as EventCenter<T>["registEventHandlers"]

  function clearAll() {
    storedCallbackStore.clear()
  }
  function clear(eventName: keyof T) {
    storedCallbackStore.delete(eventName)
  }

  const eventCenter = {
    onAnyEvent,
    registEventHandlers: registEvents,
    on,
    emit,
    clearAll,
    clear,
    _eventCenterId,
  } as EventCenter<T>

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
