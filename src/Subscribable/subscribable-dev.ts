import { Subscription } from "../customizedClasses/Subscription"
import { isFunction, isObjectLike } from "../dataType"
import { IdGenerator } from "../id"
import { PluginSystem, type Plugin, type Pluginable } from "../plugin-system"
import { AnyFn, type ID, type IDNumber } from "../typings"

const subscribableBrand = Symbol("subscribable")

const subscribableIdGenerator = new IdGenerator("subscribable")

/** subscriberFN 每次收到值时对应的传播信息。 */
export interface SubscribableContext<Value> {
  /** 本次写入前的值；立即交付当前值时是 undefined。 */
  prev: Value | undefined

  /** 已完成写入的版本；同一次写入交付给所有订阅者的版本相同。 */
  version: number
}

/**
 * 接收当前值和本次传播上下文。
 * 返回的清理函数会在下一次交付、取消订阅或销毁时执行一次。
 */
export type SubscribableSubscriberFN<Value> = (value: Value, context: SubscribableContext<Value>) => void | (() => void)

/** set 接受同步值或同步更新函数；函数只用于计算，不能作为值保存。 */
export type SubscribableSetValueDispatcher<Value> = Value | ((oldValue: Value) => Value)

/** Subscribable 允许插件处理准备写入的值。 */
export type SubscribablePluginChannels<Value> = {
  beforeSet: Value
}

/** 可以装入 Subscribable 的 Plugin。 */
export type SubscribablePlugin<Value> = Plugin<SubscribablePluginChannels<Value>>

/** 创建 Subscribable 时确定的名称、写入规则和初始插件。 */
export interface SubscribableConstructorOptions<Value> {
  /** 用于调试和辨认实例的名称。 */
  name?: string

  /** 插件完成转换后，最后关头，对本次输入做最后处理。 */
  refine?: (newValue: Value, prevValue: Value, utils: { self: Subscribable<Value> }) => Value

  /** 判断最终输入与当前值是否相同，默认使用 Object.is。 */
  equals?: (value: Value, prevValue: Value) => boolean

  /** 创建实例时按顺序安装的插件。 */
  plugins?: SubscribablePlugin<Value>[]
}

type SubscribeDetailInfo<Value> = {
  /** 订阅返回的控制器 */
  subscription: Subscription
  subscriberFN: SubscribableSubscriberFN<Value>
  once: boolean
  key?: string
  cleanupFN?: () => void
}

/**
 * 保存一个当前值，并在 set 写入后通知订阅者。
 * 当前值通过 value 读取；订阅关系和派生关系随实例销毁。
 */
export class Subscribable<Value> implements Pluginable<SubscribablePluginChannels<Value>> {
  /** 当前实例的数字标识。 */
  id: ID;

  /** 标记当前对象属于 Subscribable，由 isSubscribable 读取。 */
  [subscribableBrand] = true

  /** 此subscribable 的名字，用于调试和辨认实例的名称。 */
  name: string

  /** 当前值；读取用 value，更新用 set，外界只读。 */
  value: Value

  /** 是否已经结束生命周期；由 destroy 更新，外界只读。 */
  closed = false

  /** 最终值的比较规则；由 constructor 设置，外界不要直接改。 */
  equals: (value: Value, prevValue: Value) => boolean

  /** 当前实例自己的插件系统与 input 管线，外界通常只读取。 */
  pluginSystem = new PluginSystem<SubscribablePluginChannels<Value>>({
    name: "subscribable",
  })

  /** 与 pluginSystem.loadedPlugins 指向同一份装载记录，外界通常只读取。 */
  loadedPlugins = this.pluginSystem.loadedPlugins

  #version = 0
  #refineFN: SubscribableConstructorOptions<Value>["refine"]
  #subscriptions = new Map<Subscription, SubscribeDetailInfo<Value>>()
  #keyedSubscriptions = new Map<string, Subscription>()
  #destroyCallbacks = new Map<Subscription, AnyFn>()

  /** 创建实例并取得初始值；函数形式的输入会惰性求值，不会作为值保存。 */
  constructor(defaultValue: Value | (() => Value), options?: SubscribableConstructorOptions<Value>) {
    this.id = subscribableIdGenerator.genID()
    this.name = options?.name ?? "(anonymous)"
    this.value = isFunction(defaultValue) ? defaultValue() : defaultValue
    this.equals = options?.equals ?? Object.is
    this.#refineFN = options?.refine

    options?.plugins?.forEach((plugin) => this.load(plugin))
  }

  /**
   * 把插件的 input wrapper 追加到当前实例。
   * 每次 load 都会追加，且只影响之后的写入。
   */
  load(plugin: SubscribablePlugin<Value>): void {
    this.#assertOpen("安装插件")
    this.pluginSystem.load(plugin)
  }

  /**
   * 订阅当前值和后续写入；immediately 默认立即交付已有值。
   * key 相同会先结束旧订阅，once 在第一次交付结束后取消本次订阅。
   */
  subscribe(
    subscriberFN: SubscribableSubscriberFN<Value>,
    options?: {
      /** 相同 key 重复订阅时，由新订阅接替旧订阅。 */
      key?: string

      /** subscriberFN 完成第一次交付后取消本次订阅。 */
      once?: boolean

      /** 是否在订阅时立即交付当前值，默认是。 */
      immediately?: boolean
    },
  ): Subscription {
    this.#assertOpen("订阅")

    if (options?.key) this.#keyedSubscriptions.get(options.key)?.unsubscribe()

    const subscription = new Subscription({
      onUnsubscribe: (currentSubscription) => {
        this.#removeSubscription(currentSubscription)
      },
    })

    this.#subscriptions.set(subscription, {
      subscription,
      subscriberFN,
      once: options?.once ?? false,
      key: options?.key,
    })

    if (options?.key) this.#keyedSubscriptions.set(options.key, subscription)

    if (options?.immediately ?? true) {
      try {
        this.#deliver(subscription, this.value, {
          prev: undefined,
          version: this.#version,
        })
      } catch (error) {
        subscription.unsubscribe()
        throw error
      }
    }

    return subscription
  }

  /**
   * 同步写入值或根据旧值计算新值。
   * input 插件和 beforeSet 转换完成后再比较；force 可以强制写入相同值。
   */
  set(
    dispatcher: SubscribableSetValueDispatcher<Value>,
    options?: {
      /** 即使最终值与当前值相同，也完成写入并通知订阅者。 */
      force?: boolean
    },
  ): void {
    this.#assertOpen("写入")

    const rawInput = isFunction(dispatcher) ? dispatcher(this.value) : dispatcher
    const prev = this.value
    let value = this.pluginSystem.pass("beforeSet", rawInput)

    // 插件处理公共输入，实例自己的写入规则最后收口。
    if (this.#refineFN) {
      value = this.#refineFN(value, prev, { self: this })
    }

    if (!options?.force && this.equals(value, prev)) return

    this.value = value
    this.#version += 1
    this.#broadcast(value, { prev, version: this.#version })
  }

  /** 创建一个由当前值转换而来的 Subscribable，并持续跟随后续写入。 */
  pipe<MappedValue>(mapperFN: (value: Value) => MappedValue): Subscribable<MappedValue> {
    this.#assertOpen("创建派生值")

    const derived = new Subscribable(mapperFN(this.value))
    const upstreamSubscription = this.subscribe((value) => derived.set(mapperFN(value)), { immediately: false })
    derived.onDestroy(() => upstreamSubscription.unsubscribe())
    return derived
  }

  /**
   * 登记实例销毁时执行的动作。
   * 返回的 Subscription 可以撤销登记，不会提前执行该动作。
   */
  onDestroy(cleanupFN: AnyFn): Subscription {
    this.#assertOpen("登记销毁动作")

    const subscription = new Subscription({
      onUnsubscribe: (currentSubscription) => {
        this.#destroyCallbacks.delete(currentSubscription)
      },
    })
    this.#destroyCallbacks.set(subscription, cleanupFN)
    return subscription
  }

  /** 结束实例生命周期，并尝试完成全部订阅和销毁清理。 */
  destroy(): void {
    if (this.closed) return
    this.closed = true

    let firstError: unknown
    for (const subscription of [...this.#subscriptions.keys()]) {
      try {
        subscription.unsubscribe()
      } catch (error) {
        firstError ??= error
      }
    }

    for (const [subscription, cleanupFN] of [...this.#destroyCallbacks.entries()]) {
      subscription.unsubscribe()
      try {
        cleanupFN()
      } catch (error) {
        firstError ??= error
      }
    }

    if (firstError !== undefined) throw firstError
  }

  /** 使用显式资源管理语法时销毁当前实例。 */
  [Symbol.dispose](): void {
    this.destroy()
  }

  #broadcast(value: Value, context: SubscribableContext<Value>): void {
    // 本轮开始后新增的订阅留到下一次写入，已经取消的订阅则立即跳过。
    const subscriptions = [...this.#subscriptions.keys()]
    subscriptions.forEach((subscription) => {
      if (!subscription.closed) this.#deliver(subscription, value, context)
    })
  }

  #deliver(subscription: Subscription, value: Value, context: SubscribableContext<Value>): void {
    const registration = this.#subscriptions.get(subscription)
    if (!registration || subscription.closed) return

    try {
      this.#runSubscriberCleanup(registration)
      const cleanupFN = registration.subscriberFN(value, context)
      if (isFunction(cleanupFN)) registration.cleanupFN = cleanupFN
    } finally {
      if (registration.once) subscription.unsubscribe()
    }
  }

  #removeSubscription(subscription: Subscription): void {
    const registration = this.#subscriptions.get(subscription)
    if (!registration) return

    this.#subscriptions.delete(subscription)
    if (registration.key && this.#keyedSubscriptions.get(registration.key) === subscription) {
      this.#keyedSubscriptions.delete(registration.key)
    }
    this.#runSubscriberCleanup(registration)
  }

  #runSubscriberCleanup(registration: SubscribeDetailInfo<Value>): void {
    const cleanupFN = registration.cleanupFN
    registration.cleanupFN = undefined
    cleanupFN?.()
  }

  /** 确保当前实例未被销毁。 */
  #assertOpen(action: string): void {
    if (this.closed) {
      throw new Error(`Subscribable 已经销毁，不能${action}`)
    }
  }
}

/** 判断一个值是否由 Subscribable 创建。 */
export function isSubscribable<Value>(value: unknown): value is Subscribable<Value> {
  return isObjectLike(value) && subscribableBrand in value && value[subscribableBrand] === true
}
