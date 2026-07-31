import { Subscription } from "../Subscription"

/** 跟随 Neuron 一直存在；Neuron 会自动更新 prev，插件也可以调整 context。 */
export interface NeuronContext<Output = unknown> {
  /** 当前 Neuron 上一次产生的 output；第一次 tick 时是 undefined。插件可以改，但通常没有必要。 */
  prev: Output | undefined

  /** 插件可以增加自己的字段；字段内容由对应插件管理。 */
  [pluginField: string]: unknown
}

/** 决定一次 input 经过 Neuron 后会得到什么 output。 */
export type NeuronMapperFN<Input, Output> = (input: Input) => Output

/** Neuron 每产生一次 output，就把 output 和 context 交给这个函数。 */
export type NeuronSubscriberFN<Output> = (
  output: Output,
  context: NeuronContext<Output>,
) => void

/** 订阅 Neuron 以后的 output；插件可以包装这个入口。 */
export type NeuronSubscribeFN<Output> = (
  subscriberFN: NeuronSubscriberFN<Output>,
) => Subscription

type NeuronSubscriber<Output> = {
  subscriberFN: NeuronSubscriberFN<Output>
}

/** 运行时装到 Neuron 上的扩展；完整历史和重放由插件负责。 */
export interface NeuronPlugin<Input, Output> {
  /** 第一次装到某个 Neuron 时调用；同一个插件对象不会在该 Neuron 上重复安装。 */
  install(neuron: Neuron<Input, Output>): void

  /** 每次广播前拿到同一个 context；插件可以读取或调整其中的内容。 */
  refineContext?(output: Output, context: NeuronContext<Output>): void
}

/**
 * Neuron 用 mapper 处理每次 tick 的 input，再把 output 交给订阅函数。
 * 它一直持有同一个 context，并自动维护其中的 prev；插件可以继续扩展。
 */
export class Neuron<Input, Output = Input> {
  /** 决定 input 怎样变成 output。改变转换方式要通过插件，业务代码不要自己改。 */
  mapper: NeuronMapperFN<Input, Output>

  /** 等待下一次 output 的订阅。subscribe 和 unsubscribe 会维护它；插件可以扩展，业务代码不要自己增删。 */
  subscribers = new Set<NeuronSubscriber<Output>>()

  /** 已经装到当前 Neuron 的插件。loadPlugin 会登记它们，业务代码不要自己增删。 */
  loadedPlugins = new Set<NeuronPlugin<Input, Output>>()

  /** 一直使用同一个对象。Neuron 自动更新 prev；插件可以调整字段，业务代码只读取。 */
  context: NeuronContext<Output> = { prev: undefined }

  private constructor(mapper: NeuronMapperFN<Input, Output>) {
    this.mapper = mapper
  }

  /** 创建一个原样传递 input 的 Neuron；它只处理以后 tick 进来的值。 */
  static source<T>(): Neuron<T, T> {
    return new Neuron<T, T>((input) => input)
  }

  /**
   * 新建一个 Neuron，让它接收 source 以后的 output，再交给 mapper。
   * 新节点有自己的 context，不继承 source 的 context，也不会补收旧 output。
   */
  static deriveFrom<SourceInput, SourceOutput, DerivedOutput>(
    source: Neuron<SourceInput, SourceOutput>,
    mapper: NeuronMapperFN<SourceOutput, DerivedOutput>,
  ): Neuron<SourceOutput, DerivedOutput> {
    const derivedNeuron = new Neuron<SourceOutput, DerivedOutput>(mapper)
    source.subscribe((output) => derivedNeuron.tick(output))
    return derivedNeuron
  }

  /**
   * 按顺序把插件装到目标 Neuron；同一个插件对象在该 Neuron 上只装一次。
   * 某个 install 抛错后，后面的插件不再安装。
   */
  static loadPlugin<Input, Output>(options: {
    to: Neuron<Input, Output>
    plugins: NeuronPlugin<Input, Output>[]
  }): Neuron<Input, Output> {
    for (const plugin of options.plugins) {
      if (options.to.loadedPlugins.has(plugin)) continue

      plugin.install(options.to)
      options.to.loadedPlugins.add(plugin)
    }

    return options.to
  }

  /**
   * 以后每次产生 output 都调用 subscriberFN，不补发旧 output。
   * 返回的 Subscription 只取消这一次订阅；广播中的增删从下一次生效。
   */
  subscribe: NeuronSubscribeFN<Output> = (subscriberFN) => {
    const subscriber = { subscriberFN }
    this.subscribers.add(subscriber)

    return new Subscription({
      onUnsubscribe: () => {
        this.subscribers.delete(subscriber)
      },
    })
  }

  /**
   * 让数据流过当前 Neuron 时调用。
   * mapper 产生 output 后，插件和订阅函数依次使用 context；prev 此时仍是上一次 output。
   * tick 结束前，prev 会更新为本次 output；中途抛错也会更新。
   */
  tick(input: Input): void {
    const output = this.mapper(input)

    try {
      for (const plugin of [...this.loadedPlugins]) {
        plugin.refineContext?.(output, this.context)
      }

      this.#broadcast(output)
    } finally {
      this.context.prev = output
    }
  }

  /** 用开始广播时的订阅快照逐个调用；某个订阅函数抛错后，剩余函数不再调用。 */
  #broadcast(output: Output): void {
    const propagationSnapshot = [...this.subscribers]
    for (const subscriber of propagationSnapshot) {
      const subscriberFN = subscriber.subscriberFN
      subscriberFN(output, this.context)
    }
  }
}
