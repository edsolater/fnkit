import { Subscription } from "../Subscription"

/** 跟随 Neuron 一直存在，字段由插件按需扩展。 */
export interface NeuronContext {
  /** 插件可以增加自己的字段；字段内容由对应插件管理。 */
  [pluginField: string]: unknown
}

/** 把一次 value 映射成 newValue；每个 Neuron 保存自己的当前 mapper。 */
export type NeuronMapperFN<Value, NewValue> = (value: Value, context: NeuronContext) => NewValue

/** Neuron 每次激活后，把当前 value 和 context 交给这个函数。 */
export type NeuronSubscriberFN<Value> = (value: Value, context: NeuronContext) => void

/** 订阅 Neuron 以后的 value；插件可以包装这个入口。 */
export type NeuronSubscribeFN<Value> = (subscriberFN: NeuronSubscriberFN<Value>) => Subscription

type NeuronSubscriber<Value> = {
  subscriberFN: NeuronSubscriberFN<Value>
}

/** 运行时装到 Neuron 上的扩展；完整历史和重放由插件负责。 */
export interface NeuronPlugin<Value, FromValue = Value> {
  /** 第一次装到某个 Neuron 时调用；同一个插件对象不会在该 Neuron 上重复安装。 */
  install(neuron: Neuron<Value, FromValue>): void

  /** 每次广播前拿到同一个 context；插件可以读取或调整其中的内容。 */
  refineContext?(value: Value, context: NeuronContext): void
}

/**
 * Neuron 用当前 mapper 处理每次 tick 的值，并保存最近一次激活得到的核心 value。
 * 它持有自己的 mapper、value、context 和连接关系，不内置完整历史或重放。
 */
export class Neuron<Value, FromValue = Value> {
  /** 当前映射规则；改变映射方式要通过插件，业务代码不要自己改。 */
  mapper: NeuronMapperFN<FromValue, Value>

  /** 最近一次成功激活得到的核心值；第一次 tick 以前是 undefined，外界只读取。 */
  value: Value | undefined = undefined

  /** 等待下一次 value 的订阅。subscribe 和 unsubscribe 会维护它；插件可以扩展，业务代码不要自己增删。 */
  subscribers = new Set<NeuronSubscriber<Value>>()

  /** 已经装到当前 Neuron 的插件。loadPlugin 会登记它们，业务代码不要自己增删。 */
  loadedPlugins = new Set<NeuronPlugin<Value, FromValue>>()

  /** 一直使用同一个对象；插件可以调整字段，业务代码通常只读取。 */
  context: NeuronContext = {}

  private constructor(mapper: NeuronMapperFN<FromValue, Value>) {
    this.mapper = mapper
  }

  /** 创建一个原样接收 value 的 Neuron；第一次 tick 以前没有核心值。 */
  static source<T>(): Neuron<T> {
    return new Neuron<T>((value) => value)
  }

  /**
   * 在当前 Neuron 后接入一个使用新 mapper 的下游 Neuron。
   * mapper 会成为新节点自己的当前映射；新节点不会补收当前 value。
   */
  pipe<NewValue>(mapper: NeuronMapperFN<Value, NewValue>): Neuron<NewValue, Value> {
    const nextNeuron = new Neuron<NewValue, Value>(mapper)
    this.subscribe((value) => nextNeuron.tick(value))
    return nextNeuron
  }

  /**
   * 按顺序把插件装到目标 Neuron；同一个插件对象在该 Neuron 上只装一次。
   * 某个 install 抛错后，后面的插件不再安装。
   */
  static loadPlugin<Value, FromValue = Value>(options: {
    to: Neuron<Value, FromValue>
    plugins: NeuronPlugin<Value, FromValue>[]
  }): Neuron<Value, FromValue> {
    for (const plugin of options.plugins) {
      if (options.to.loadedPlugins.has(plugin)) continue

      plugin.install(options.to)
      options.to.loadedPlugins.add(plugin)
    }

    return options.to
  }

  /**
   * 以后每次激活都调用 subscriberFN，不补发当前 value。
   * 返回的 Subscription 只取消这一次订阅；广播中的增删从下一次生效。
   */
  subscribe: NeuronSubscribeFN<Value> = (subscriberFN) => {
    const subscriber = { subscriberFN }
    this.subscribers.add(subscriber)

    return new Subscription({
      onUnsubscribe: () => {
        this.subscribers.delete(subscriber)
      },
    })
  }

  /**
   * 激活当前 Neuron 时调用。
   * mapper 使用当前 context 产生新 value；Neuron 先保存它，再交给插件和订阅函数。
   */
  tick(value: FromValue): void {
    const newValue = this.mapper(value, this.context)
    this.value = newValue

    for (const plugin of [...this.loadedPlugins]) {
      plugin.refineContext?.(newValue, this.context)
    }

    this.#broadcast(newValue)
  }

  /** 用开始广播时的订阅快照逐个调用；某个订阅函数抛错后，剩余函数不再调用。 */
  #broadcast(value: Value): void {
    const propagationSnapshot = [...this.subscribers]
    for (const subscriber of propagationSnapshot) {
      const subscriberFN = subscriber.subscriberFN
      subscriberFN(value, this.context)
    }
  }
}
