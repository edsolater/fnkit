import { Subscription } from "../customizedClasses/Subscription"
import { isFunction, isObjectLike } from "../dataType"
import { IdGenerator } from "../id"
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

/**
 * 安装时取得目标实例，并返回参与后续生命周期的扩展。
 * 返回的扩展不处理安装前已经保存的值。
 */
export type SubscribablePluginFN<Value> = (subscribable: Subscribable<Value>) => {
  /** 写入时按插件安装顺序转换输入。 */
  beforeSet?: SubscribableConstructorOptions<Value>["beforeSet"]

  /** 值写入后、订阅者收到通知前调用。 */
  onSet?: SubscribableConstructorOptions<Value>["onSet"]

  /** 插件安装完成后在微任务中调用。 */
  onInit?: SubscribableConstructorOptions<Value>["onInit"]

  /** 替换后续写入使用的值比较规则。 */
  equals?: SubscribableConstructorOptions<Value>["equals"]
} | void

/** @deprecated 直接给插件函数标注 SubscribablePluginFN 类型即可。 */
export function createSubscribablePlugin<Value>(pluginFN: SubscribablePluginFN<Value>) {
  return pluginFN
}

/** 创建 Subscribable 时确定的名称、写入规则和初始插件。 */
export interface SubscribableConstructorOptions<Value> {
  /** 用于调试和辨认实例的名称。 */
  name?: string

  /** 插件完成转换后，对本次输入做最后处理。 */
  beforeSet?: (newValue: Value, prevValue: Value, utils: { self: Subscribable<Value> }) => Value

  /** 值写入后、订阅者收到通知前调用。 */
  onSet?: (value: Value, prevValue: Value, utils: { self: Subscribable<Value> }) => void

  /** 实例创建完成后在微任务中调用。 */
  onInit?: (utils: { set: Subscribable<Value>["set"]; self: Subscribable<Value> }) => void

  /** 判断最终输入与当前值是否相同，默认使用 Object.is。 */
  equals?: (value: Value, prevValue: Value) => boolean

  /** 创建实例时按顺序安装的插件。 */
  plugins?: SubscribablePluginFN<Value>[]
}

type SubscriptionRegistration<Value> = {
  subscriberFN: SubscribableSubscriberFN<Value>
  once: boolean
  key?: string
  cleanupFN?: () => void
}

/**
 * 保存一个当前值，并在 set 写入后通知订阅者。
 * 当前值通过 value 读取；订阅关系和派生关系随实例销毁。
 */
export class Subscribable<Value> {
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

  /** 最终值的比较规则；由 constructor 或插件设置，外界不要直接改。 */
  equals: (value: Value, prevValue: Value) => boolean

  #version = 0
  #beforeSetFN: SubscribableConstructorOptions<Value>["beforeSet"]
  #onSetFN: SubscribableConstructorOptions<Value>["onSet"]
  #pluginBeforeSetFNs: NonNullable<SubscribableConstructorOptions<Value>["beforeSet"]>[] = []
  #pluginOnSetFNs: NonNullable<SubscribableConstructorOptions<Value>["onSet"]>[] = []
  #subscriptions = new Map<Subscription, SubscriptionRegistration<Value>>()
  #keyedSubscriptions = new Map<string, Subscription>()
  #destroyCallbacks = new Map<Subscription, AnyFn>()
  #loadedPlugins = new Set<SubscribablePluginFN<Value>>()

  /** 创建实例并取得初始值；函数形式的输入会惰性求值，不会作为值保存。 */
  constructor(defaultValue: Value | (() => Value), options?: SubscribableConstructorOptions<Value>) {
    this.id = subscribableIdGenerator.genID()
    this.name = options?.name ?? "(anonymous)"
    this.value = isFunction(defaultValue) ? defaultValue() : defaultValue
    this.equals = options?.equals ?? Object.is
    this.#beforeSetFN = options?.beforeSet
    this.#onSetFN = options?.onSet

    if (options?.onInit) this.#queueOnInit(options.onInit)
    if (options?.plugins) {
      Subscribable.loadPlugin({ to: this, plugins: options.plugins })
    }
  }

  /**
   * 按顺序把插件装到目标实例；同一个插件对象只安装一次。
   * 运行时安装只影响安装后的写入，不处理已经保存的值。
   */
  static loadPlugin<Value>(options: {
    /** 接收插件的 Subscribable。 */
    to: Subscribable<Value>

    /** 按数组顺序安装；同一个函数对象只安装一次。 */
    plugins: SubscribablePluginFN<Value>[]
  }): Subscribable<Value> {
    options.to.#assertOpen("安装插件")
    options.plugins.forEach((pluginFN) => options.to.#installPlugin(pluginFN))
    return options.to
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
   * 插件和 beforeSet 转换完成后再比较；force 可以强制写入相同值。
   */
  set(
    dispatcher: SubscribableSetValueDispatcher<Value>,
    options?: {
      /** 即使最终值与当前值相同，也完成写入并通知订阅者。 */
      force?: boolean
    },
  ): void {
    this.#assertOpen("写入")

    const inputValue = isFunction(dispatcher) ? dispatcher(this.value) : dispatcher
    const prev = this.value
    let value = inputValue

    // 插件先连续转换输入，实例自身的规则负责最后收口。
    this.#pluginBeforeSetFNs.forEach((beforeSetFN) => {
      value = beforeSetFN(value, prev, { self: this })
    })
    if (this.#beforeSetFN) {
      value = this.#beforeSetFN(value, prev, { self: this })
    }

    if (!options?.force && this.equals(value, prev)) return

    this.value = value
    this.#version += 1
    this.#onSetFN?.(value, prev, { self: this })
    this.#pluginOnSetFNs.forEach((onSetFN) => {
      onSetFN(value, prev, { self: this })
    })
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

  #installPlugin(pluginFN: SubscribablePluginFN<Value>): void {
    if (this.#loadedPlugins.has(pluginFN)) return

    const extension = pluginFN(this)
    if (extension?.beforeSet) {
      this.#pluginBeforeSetFNs.push(extension.beforeSet)
    }
    if (extension?.onSet) this.#pluginOnSetFNs.push(extension.onSet)
    if (extension?.equals) this.equals = extension.equals
    if (extension?.onInit) this.#queueOnInit(extension.onInit)
    this.#loadedPlugins.add(pluginFN)
  }

  #queueOnInit(onInitFN: NonNullable<SubscribableConstructorOptions<Value>["onInit"]>) {
    Promise.resolve().then(() => {
      if (this.closed) return
      onInitFN({
        set: (dispatcher, options) => this.set(dispatcher, options),
        self: this,
      })
    })
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

  #runSubscriberCleanup(registration: SubscriptionRegistration<Value>): void {
    const cleanupFN = registration.cleanupFN
    registration.cleanupFN = undefined
    cleanupFN?.()
  }

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
