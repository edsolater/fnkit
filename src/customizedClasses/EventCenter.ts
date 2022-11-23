import { uncapitalize } from '../changeCase'
import { map } from '../collectionMethods'
import { AnyFn } from '../typings'
import { createSubscription, Subscription } from './Subscription'
import { WeakerSet } from './WeakerSet'

type EventConfig = {
  [eventName: string]: AnyFn
}

let eventCenterIdCounter = 1
function generateEventCenterId() {
  return eventCenterIdCounter++
}

export type EventCenterOptions = {
  // TODO currently a placeholder. for don't know what to write
}

export type EventCenter<T extends EventConfig> = {
  emit<N extends keyof T>(eventName: N, parameters: Parameters<T[N]>): void
  on<U extends Partial<T>>(subscriptionFns: U, options?: EventCenterOptions): { [P in keyof U]: Subscription }
} & {
  [P in keyof T as `on${Capitalize<P & string>}`]: (
    subscriptionFn: (...params: Parameters<T[P]>) => void,
    options?: EventCenterOptions
  ) => Subscription
}

/**
 *
 * @example
 *  // client side
 * cc.on({
 *   change({ status }) {
 *     // status is 'success' | 'error'
 *     // do something
 *   }
 * })
 * cc.onChange(({ status }) => {
 *   // status is 'success' | 'error'
 * })
 *
 * // server side
 * cc.emit('change', [{ status: 'success' }])
 */
// 💡 observable should be the core of js model. just like event target is the core of DOM
export function EventCenter<T extends EventConfig>(
  whenAttach?: {
    [P in keyof T as `${P & string}`]?: (utils: {
      fn: (...params: Parameters<T[P]>) => void
      emit: EventCenter<T>['emit']
    }) => void
  } & {
    [P in keyof T as `${P & string}Initly`]?: (utils: {
      fn: (...params: Parameters<T[P]>) => void
      emit: EventCenter<T>['emit']
    }) => void
  }
): EventCenter<T> {
  const _eventCenterId = generateEventCenterId()
  const storedCallbackStore = new Map<keyof T, WeakerSet<AnyFn>>()
  type CallbackParam = any[]
  const emitedValueCache = new Map<keyof T, WeakerSet<CallbackParam>>()

  const emit = ((eventName, paramters) => {
    const handlerFns = storedCallbackStore.get(eventName)

    handlerFns?.forEach((fn) => {
      fn.apply(undefined, paramters ?? [])
    })
    emitedValueCache.set(eventName, (emitedValueCache.get(eventName) ?? new WeakerSet()).add(paramters))
  }) as EventCenter<T>['emit']

  const singlyOn = (eventName: string, fn: AnyFn, options?: EventCenterOptions) => {
    // TODO currently a placeholder. for don't know what to write
    const callbackList = storedCallbackStore.get(eventName) ?? new WeakerSet()
    callbackList.add(fn) //NUG:  <-- add failed??
    storedCallbackStore.set(eventName, callbackList)

    // handle `whenAttached` side-effect
    whenAttach?.[eventName]?.({ fn, emit })
    if (!storedCallbackStore.has(eventName)) whenAttach?.[`${eventName}Initly`]?.({ fn, emit })

    // initly invoke prev emitedValues
    const cachedValues = emitedValueCache.get(eventName)
    cachedValues?.forEach((prevParamters) => {
      fn.apply(undefined, prevParamters)
    })

    return createSubscription({
      onUnsubscribe() {
        storedCallbackStore.get(eventName)?.delete(fn)
      }
    })
  }

  const on = ((subscriptionFns, options) =>
    map(
      subscriptionFns,
      (handlerFn, eventName) => handlerFn && singlyOn(String(eventName), handlerFn, options)
    )) as EventCenter<T>['on']

  const eventCenter = new Proxy(
    { on, emit, _eventCenterId },
    {
      get(target, p) {
        if (target[p] !== undefined) return target[p]
        if (String(p).startsWith('on'))
          return (fn: AnyFn, options?: EventCenterOptions) => singlyOn(uncapitalize(String(p).slice(2)), fn, options)
        return undefined
      }
    }
  ) as unknown as EventCenter<T>
  return eventCenter
}

export function mergeEventCenterFeature<O extends object, T extends EventConfig>(
  targetObject: O,
  eventCenter: EventCenter<T>
): O & EventCenter<T> {
  const merged = new Proxy(targetObject, {
    get(target, p) {
      if (p in targetObject) return target[p]
      return eventCenter[p]
    }
  }) as O & EventCenter<T>
  return merged
}
