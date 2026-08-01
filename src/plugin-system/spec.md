# Plugin System

> 这是 Plugin System 的当前协议。实现与测试必须以本文描述的行为为准。

## 插件机制描述

使用插件机制的设施定义若干允许插件介入的数据接口，Plugin System 将这些接口组织成具名 channels。
Plugin 可以为其中部分 channels 提供数据包裹器，每个包裹器只处理对应接口收到的原始数据。这些包裹器就是插件向核心机制施加影响的方式。

装载插件，就是把插件为不同 channels 提供的包裹器加入对应接口的处理管线。核心机制在合适的时机调用 `pass`，让原始数据依次经过该接口中的包裹器，再取得处理后的结果。

这里还准确保留了一个边界：Plugin 不必为每条 channel 都提供包裹器，但它提供的每个包裹器都对应一条明确的 channel。

```text
输入
  -> pass("userInput")
  -> 业务自己的处理
  -> pass("output")
  -> 输出
```

业务仍然掌握主流程。插件只能影响业务主动交给 Plugin System 的数据。

## 完整示例

Neuron 在业务流程中使用 `userInput` 和 `output` 两条通道，每个 Neuron 拥有自己的 Plugin System 和处理管线。

```ts
type NeuronChannels = {
  userInput: string
  output: string
}

type NeuronPlugin = Plugin<NeuronChannels>

const pluginXXX = PluginSystem.createPlugin({
  userInput: (raw: string) => raw + " hello",
  output: (raw: string) => raw + " xxx",
})

const pluginYYY = PluginSystem.createPlugin({
  userInput: (raw: string) => raw + " world",
})

const pluginZZZ = PluginSystem.createPlugin({
  output: (raw: string) => raw + " hi",
})

class Neuron implements Pluginable<NeuronChannels> {
  pluginSystem = new PluginSystem<NeuronChannels>({
    name: "neuron-plugin-system",
  })

  loadedPlugins = this.pluginSystem.loadedPlugins

  constructor() {
    this.load(pluginXXX)
    this.load(pluginYYY)
  }

  load(plugin: NeuronPlugin): void {
    this.pluginSystem.load(plugin)
  }

  sayHello(userInput: string): string {
    const input = this.pluginSystem.pass("userInput", userInput)
    const rawOutput = input + " done"

    return this.pluginSystem.pass("output", rawOutput)
  }
}
```

运行结果：

```ts
const neuron = new Neuron()

neuron.sayHello("neuron1:")
// "neuron1: hello world done xxx"

neuron.load(pluginZZZ)

neuron.sayHello("neuron2:")
// "neuron2: hello world done xxx hi"
```

第一次调用的数据依次经历：

```text
"neuron1:"
  -> pluginXXX.userInput
  -> pluginYYY.userInput
  -> Neuron 自己添加 " done"
  -> pluginXXX.output
  -> "neuron1: hello world done xxx"
```

装载 `pluginZZZ` 后，它提供的 output wrapper 被追加到已有管线末尾，所以第二次结果增加 `" hi"`。

## 四个核心概念

### Plugin System

管理一组具名 channel 管线。它只负责装配和执行管线，不理解通道名称的业务含义。

每个 Pluginable 实例持有自己的 Plugin System。不同实例可以装载不同插件，互不影响。

Plugin System 不要求业务在构造时重复登记 channels。`load` 根据插件提供的 wrapper 名称形成管线，业务在需要处理数据的位置使用同一名称调用 `pass`。

### Channel

业务流程中允许插件处理数据的具名通道。

业务通过类型和实际调用的名称定义 channel，并决定数据何时通过它。通道没有 wrapper 时，数据原样通过。

### Plugin

一组按 channel 名称声明的 wrappers。插件可以只处理自己关心的 channels：

```ts
const plugin = PluginSystem.createPlugin({
  output: (raw: string) => raw + " hi",
})
```

同一个插件可以为多条 channels 提供 wrapper。多个插件处理同一 channel 时，前一个 wrapper 的结果会传给后一个 wrapper。

`createPlugin` 不强制调用者先声明完整的 channels 类型。需要更严格的检查时，可以显式提供 channels 类型：

```ts
const plugin = PluginSystem.createPlugin<NeuronChannels>({
  output: (raw) => raw + " hi",
})
```

无论是否显式提供类型，每个 wrapper 都遵守同一条基础契约：输入和输出是同一种值。

### Pluginable

表示一个领域对象正式支持插件扩展。

```ts
export interface Pluginable<Channels extends PluginChannels = PluginChannels> {
  pluginSystem: PluginSystem<Channels>
  loadedPlugins: Plugin<Channels>[]
  load(plugin: Plugin<Channels>): void
}
```

看到 `class Neuron implements Pluginable` 时，阅读者无需查看实现，也能预期 Neuron 拥有独立的插件系统、能够装载插件，并在核心流程中开放了 channels。

`loadedPlugins` 与 `pluginSystem.loadedPlugins` 指向同一份装载记录，不由宿主另外维护第二份账本。

## 装载与管线

每次调用 `load(plugin)`，Plugin System 都会：

1. 把 plugin 记入 `loadedPlugins`。
2. 读取 plugin 为各条 channel 提供的 wrapper。
3. 取得或建立对应 channel，把 wrapper 追加到处理管线末尾。

能够作为函数调用的字段会形成 channel wrapper；其他字段自然不参与，不因此报错。`pass` 收到尚未形成管线的 channel 时，数据原样通过。

同一个插件对象重复 `load` 时，每次都追加新的处理模块，不按对象身份去重：

```ts
pluginSystem.load(pluginXXX)
pluginSystem.load(pluginXXX)
```

此时 `pluginXXX.userInput` 会在一次 `pass("userInput", value)` 中执行两次。

wrapper 进入管线后，就是该管线中的一个处理模块。此后替换 plugin 对象上的同名字段，不会替换已经装入管线的模块；再次调用 `load`，才会把新的 wrapper 继续追加进去。

## 第一版协议

- channels 由使用 Plugin System 的领域定义。
- channels 不需要在 Plugin System 构造时重复登记。
- 每条 channel 处理一种确定的数据类型。
- 插件可以为一条或多条 channels 提供 wrapper，也可以忽略其他 channels。
- wrapper 暂时只支持同步的 `(value) => value`。
- 同一 channel 中的 wrappers 按照插件装载顺序执行。
- 构造时装载和运行时装载使用同一个 `load` 入口。
- 后装载的 wrapper 只影响后续数据，不回放以前的数据。
- 同一个 plugin 可以重复装载，每次装载都会追加新的 wrapper 模块。
- 每个 Pluginable 实例拥有独立的 Plugin System 和处理管线。
- `loadedPlugins` 只有一份真实记录。
- 业务必须显式调用 `pass`，Plugin System 不扫描也不接管业务过程。
- Plugin System 不通过运行时报错约束插件怎样声明或使用 channels；当前系统无法使用的内容会被忽略。

它不是事件系统、订阅系统或依赖注入容器，也不会内置 `beforeSet`、`onSet`、`refineContext` 等具体业务生命周期。

## API 名称

| 名称 | 含义 |
| --- | --- |
| `channels` | 当前已经形成的 channel 与 wrapper 管线 |
| `PluginSystem.createPlugin` | 创建一个由 channel wrappers 组成的插件 |
| `load(plugin)` | 把插件提供的 wrappers 追加到当前实例的通道管线 |
| `loadedPlugins` | 按装载次数记录当前实例装载过的插件 |
| `pass(channelName, value)` | 让一次数据依次经过指定 channel 的 wrapper 管线 |
