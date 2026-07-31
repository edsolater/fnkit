import { Subscription } from "./Subscription"

type EventMap<Events> = {
  [EventName in keyof Events]: unknown[]
}

type EventListener<Args extends unknown[]> = (this: void, ...args: Args) => void

export type EventListenerOptions = {
  /** 是否只监听下一次派发。 */
  once?: boolean
}

type ListenerRegistration<Args extends unknown[]> = {
  listener: EventListener<Args>
  once: boolean
  subscription: Subscription
}

type ListenerStore<Events extends EventMap<Events>> = {
  // 同event name下会同时存在多个监听器，所以用set
  [EventName in keyof Events]?: Set<ListenerRegistration<Events[EventName]>>
}

/**
 * 同步派发强类型事件。
 *
 * 每次订阅都是独立的注册记录；即使 listener 相同，取消其中一次订阅也不会影响另一次。
 * 派发使用开始时的监听器快照，派发期间的新增或删除只影响后续事件。
 */
export class EventEmitter<Events extends EventMap<Events>> {
  /** 事件监听器存储 */
  private listeners: ListenerStore<Events> = {}

  /** 回调订阅后下发的控制器 */
  private subscriptions = new Set<Subscription>()

  /**
   * 持续监听一个事件。
   *
   * 每次调用都会创建独立订阅；相同 listener 多次订阅时，需要分别取消。
   * `once` 启用时，Subscription 会在 listener 执行前关闭，
   * listener 内递归派发同一事件时不会再次触发。
   */
  on<EventName extends keyof Events>(
    eventName: EventName,
    listener: EventListener<Events[EventName]>,
    options?: EventListenerOptions,
  ): Subscription {
    const registrations = getOrCreateProperty(
      this.listeners,
      eventName,
      () => new Set<ListenerRegistration<Events[EventName]>>(),
    )

    if (!registrations) {
      throw new TypeError("EventEmitter 的 listener 集合不能是 undefined")
    }

    const subscription = new Subscription({
      onUnsubscribe: () => {
        // 取消必须同步移除两个索引，避免留下不可达的注册记录或全局订阅。
        registrations.delete(registration)
        this.subscriptions.delete(subscription)

        if (registrations.size === 0) {
          delete this.listeners[eventName]
        }
      },
    })

    const registration: ListenerRegistration<Events[EventName]> = {
      listener,
      once: options?.once ?? false,
      subscription,
    }

    registrations.add(registration)
    this.subscriptions.add(subscription)

    return subscription
  }

  /**
   * 同步派发一个事件。
   *
   * listener 按注册顺序执行；任一 listener 抛出异常时，异常继续向调用方传播，
   * 本次派发随即停止。普通函数 listener 的 this 为 undefined。
   *
   * @returns 派发开始时是否存在该事件的 listener。
   */
  emit<EventName extends keyof Events>(eventName: EventName, args: Events[EventName]): boolean {
    const registrations = this.listeners[eventName]
    if (!registrations || registrations.size === 0) return false

    // 固定本轮派发边界，避免 listener 内的订阅变更影响正在进行的遍历。
    const dispatchSnapshot = [...registrations]
    for (const registration of dispatchSnapshot) {
      // 先关闭一次性订阅，避免 listener 递归派发同一事件时再次进入。
      if (registration.once) registration.subscription.unsubscribe()

      // 先取出函数，避免属性调用把内部 registration 作为 listener 的 this。
      const listener = registration.listener
      listener(...args)
    }
    return true
  }

  /**
   * 取消指定事件的全部订阅；省略 eventName 时取消此 emitter 的全部订阅。
   *
   * 已经进入派发快照的 listener 仍会完成当前派发，本次取消只影响后续事件。
   */
  removeAllListeners(): void
  removeAllListeners<EventName extends keyof Events>(eventName: EventName): void
  removeAllListeners<EventName extends keyof Events>(eventName?: EventName): void {
    if (eventName === undefined) {
      for (const subscription of [...this.subscriptions]) {
        subscription.unsubscribe()
      }
      return
    }

    const registrations = this.listeners[eventName]
    if (!registrations) return

    for (const registration of [...registrations]) {
      registration.subscription.unsubscribe()
    }
  }

}

/**
 * 取得对象属性；键不存在时创建属性值并写入。
 *
 * 键是否存在是唯一判断，已有键的值即使是 undefined 也会直接返回。
 */
function getOrCreateProperty<Target extends object, Key extends keyof Target>(
  target: Target,
  key: Key,
  createValue: () => Target[Key],
): Target[Key] {
  if (!(key in target)) {
    target[key] = createValue()
  }

  return target[key]
}
