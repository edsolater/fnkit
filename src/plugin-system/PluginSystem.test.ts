import { describe, expect, test, vi } from "vitest"
import {
  PluginSystem,
  type Plugin,
  type Pluginable,
} from "./PluginSystem"

type TestChannels = {
  input: string
  output: string
  count: number
}

const createTestSystem = () =>
  new PluginSystem<TestChannels>({
    name: "test-plugin-system",
  })

describe("Plugin System 数据通道", () => {
  test("没有 wrapper 的 channel 会原样返回数据", () => {
    const pluginSystem = createTestSystem()

    expect(pluginSystem.pass("input", "raw")).toBe("raw")
    expect(pluginSystem.pass("count", 2)).toBe(2)
  })

  test("插件可以只处理部分 channels", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin<TestChannels>({
      output: (value) => `${value} processed`,
    })

    pluginSystem.load(plugin)

    expect(pluginSystem.pass("input", "raw")).toBe("raw")
    expect(pluginSystem.pass("output", "raw")).toBe("raw processed")
  })

  test("显式写成 undefined 的可选 channel 不会产生 wrapper", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin<TestChannels>({
      input: undefined,
      output: (value) => `${value} processed`,
    })

    pluginSystem.load(plugin)

    expect(pluginSystem.pass("input", "raw")).toBe("raw")
    expect(pluginSystem.pass("output", "raw")).toBe("raw processed")
  })

  test("同一 channel 按插件装载顺序处理数据", () => {
    const pluginSystem = createTestSystem()
    const firstPlugin = PluginSystem.createPlugin({
      input: (value: string) => `${value} first`,
    })
    const secondPlugin = PluginSystem.createPlugin({
      input: (value: string) => `${value} second`,
    })

    pluginSystem.load(firstPlugin)
    pluginSystem.load(secondPlugin)

    expect(pluginSystem.pass("input", "raw")).toBe("raw first second")
  })

  test("一个插件可以同时向多条 channels 提供 wrappers", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin<TestChannels>({
      input: (value) => value.toUpperCase(),
      count: (value) => value + 1,
    })

    pluginSystem.load(plugin)

    expect(pluginSystem.pass("input", "raw")).toBe("RAW")
    expect(pluginSystem.pass("count", 2)).toBe(3)
  })

  test("load 会按插件提供的名称形成 channel 管线", () => {
    const pluginSystem = createTestSystem()
    const inputWrapper = (value: string) => value.toUpperCase()
    const plugin = PluginSystem.createPlugin({ input: inputWrapper })

    pluginSystem.load(plugin)

    expect([...pluginSystem.channels.keys()]).toEqual(["input"])
    expect(pluginSystem.channels.get("input")).toEqual([inputWrapper])
  })

  test("运行时装载只影响后续通过 channel 的数据", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin({
      output: (value: string) => `${value} later`,
    })

    expect(pluginSystem.pass("output", "before")).toBe("before")

    pluginSystem.load(plugin)

    expect(pluginSystem.pass("output", "after")).toBe("after later")
  })
})

describe("Plugin System 插件装载", () => {
  test("重复装载同一个插件会重复追加 wrapper", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin({
      count: (value: number) => value + 1,
    })

    pluginSystem.load(plugin)
    pluginSystem.load(plugin)

    expect(pluginSystem.pass("count", 0)).toBe(2)
    expect(pluginSystem.loadedPlugins).toEqual([plugin, plugin])
  })

  test("替换插件字段不会改变已经装入管线的 wrapper", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin<TestChannels>({
      count: (value) => value + 1,
    })

    pluginSystem.load(plugin)
    plugin.count = (value) => value * 2

    expect(pluginSystem.pass("count", 1)).toBe(2)

    pluginSystem.load(plugin)

    expect(pluginSystem.pass("count", 1)).toBe(4)
  })

  test("不同 Plugin System 实例拥有相互隔离的管线", () => {
    const firstSystem = createTestSystem()
    const secondSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin({
      input: (value: string) => `${value} changed`,
    })

    firstSystem.load(plugin)

    expect(firstSystem.pass("input", "raw")).toBe("raw changed")
    expect(secondSystem.pass("input", "raw")).toBe("raw")
    expect(secondSystem.loadedPlugins).toHaveLength(0)
  })

  test("Pluginable 暴露 Plugin System 维护的同一份装载记录", () => {
    class PluginHost implements Pluginable<TestChannels> {
      pluginSystem = createTestSystem()
      loadedPlugins = this.pluginSystem.loadedPlugins

      load(plugin: Plugin<TestChannels>): void {
        this.pluginSystem.load(plugin)
      }
    }

    const host = new PluginHost()
    const plugin = PluginSystem.createPlugin({
      output: (value: string) => `${value} changed`,
    })

    host.load(plugin)

    expect(host.loadedPlugins).toBe(host.pluginSystem.loadedPlugins)
    expect(host.loadedPlugins).toEqual([plugin])
  })

  test("插件可以形成业务类型尚未声明的 channel 管线", () => {
    const pluginSystem = createTestSystem()
    const validWrapper = vi.fn((value: string) => `${value} valid`)
    const plugin = PluginSystem.createPlugin({
      input: validWrapper,
      missing: (value: string) => `${value} missing`,
    })

    pluginSystem.load(plugin as Plugin<TestChannels>)

    expect(pluginSystem.loadedPlugins).toEqual([plugin])
    expect(pluginSystem.pass("input", "raw")).toBe("raw valid")
    expect(
      pluginSystem.pass("missing" as keyof TestChannels, "raw"),
    ).toBe("raw missing")
    expect(pluginSystem.channels.has("missing")).toBe(true)
    expect(validWrapper).toHaveBeenCalledOnce()
  })

  test("无法作为 wrapper 使用的字段会被忽略", () => {
    const pluginSystem = createTestSystem()
    const plugin = PluginSystem.createPlugin({
      input: "not-a-wrapper" as unknown as (value: string) => string,
    })

    pluginSystem.load(plugin)

    expect(pluginSystem.loadedPlugins).toEqual([plugin])
    expect(pluginSystem.pass("input", "raw")).toBe("raw")
  })

  test("不存在的 channel 会让数据原样通过", () => {
    const pluginSystem = createTestSystem()

    expect(
      pluginSystem.pass("missing" as keyof TestChannels, "raw"),
    ).toBe("raw")
  })
})

describe("Plugin System 文档示例", () => {
  test("Neuron 的构造装载与运行时装载得到约定结果", () => {
    type NeuronChannels = {
      userInput: string
      output: string
    }
    type NeuronPlugin = Plugin<NeuronChannels>

    const pluginXXX = PluginSystem.createPlugin({
      userInput: (raw: string) => `${raw} hello`,
      output: (raw: string) => `${raw} xxx`,
    })
    const pluginYYY = PluginSystem.createPlugin({
      userInput: (raw: string) => `${raw} world`,
    })
    const pluginZZZ = PluginSystem.createPlugin({
      output: (raw: string) => `${raw} hi`,
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
        const rawOutput = `${input} done`
        return this.pluginSystem.pass("output", rawOutput)
      }
    }

    const neuron = new Neuron()

    expect(neuron.sayHello("neuron1:")).toBe(
      "neuron1: hello world done xxx",
    )

    neuron.load(pluginZZZ)

    expect(neuron.sayHello("neuron2:")).toBe(
      "neuron2: hello world done xxx hi",
    )
  })
})
