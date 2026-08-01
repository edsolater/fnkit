/** Plugin System 中所有 channel 的名称与数据类型。 */
export type PluginChannels = Record<string, any>

/** 处理一次 channel 数据；输入和输出始终是同一种值。 */
export type PluginWrapperFN<Value> = (value: Value) => Value

/** 按 channel 名称提供 wrappers；插件可以只处理部分 channels。 */
export type Plugin<Channels extends PluginChannels = PluginChannels> = {
  [Channel in keyof Channels]?: PluginWrapperFN<Channels[Channel]>
}

/** 创建 Plugin System 时声明其名称。 */
export interface PluginSystemOptions {
  /** 用于辨认当前插件系统。 */
  name: string
}

/** 表示一个领域对象拥有独立的 Plugin System，并允许装载对应插件。 */
export interface Pluginable<Channels extends PluginChannels = PluginChannels> {
  /** 当前对象自己的插件系统与 channel 管线。 */
  pluginSystem: PluginSystem<Channels>

  /** 与 pluginSystem.loadedPlugins 指向同一份装载记录，业务代码只读。 */
  loadedPlugins: Plugin<Channels>[]

  /** 把插件提供的 wrappers 追加到当前对象的 channel 管线。 */
  load(plugin: Plugin<Channels>): void
}

/**
 * 管理具名的数据通道，并按插件装载顺序组织每条通道的 wrapper 管线。
 * 它不保存经过的数据，也不主动介入业务过程；业务需要在合适的位置调用 pass。
 */
export class PluginSystem<Channels extends PluginChannels = PluginChannels> {
  /** 当前插件系统的名称，用于辨认实例。 */
  name: string

  /** 当前已经形成的 channel 管线；load 和 pass 使用它，业务代码通常只读取。 */
  channels = new Map<string, PluginWrapperFN<any>[]>()

  /** 按装载次数保存插件；重复 load 同一个插件时会重复记录。 */
  loadedPlugins: Plugin<Channels>[] = []

  /** 创建相互独立的 Plugin System 和 channel 管线。 */
  constructor(options: PluginSystemOptions) {
    this.name = options.name
  }

  /**
   * 创建插件。
   */
  static createPlugin<Channels extends PluginChannels = PluginChannels>(plugin: Plugin<Channels>): Plugin<Channels> {
    return plugin
  }

  /**
   * 加载组件
   */
  load(plugin: Plugin<Channels>): void {
    this.loadedPlugins.push(plugin)

    for (const [channel, wrapper] of Object.entries(plugin)) {
      if (typeof wrapper !== "function") continue

      const pipeline = this.channels.get(channel) ?? []
      pipeline.push(wrapper)
      this.channels.set(channel, pipeline)
    }
  }

  /** 让一次数据依次经过指定 channel 当前已经装载的 wrappers。 */
  pass<Channel extends Extract<keyof Channels, string>>(channel: Channel, value: Channels[Channel]): Channels[Channel] {
    const pipeline = this.channels.get(channel)
    if (!pipeline) return value

    // 本次 pass 使用开始时的管线，执行中新增的 wrapper 留到下一次数据。
    return [...pipeline].reduce((currentValue, wrapper) => wrapper(currentValue), value)
  }
}
