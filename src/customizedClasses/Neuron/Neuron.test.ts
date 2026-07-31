import { describe, expect, expectTypeOf, test, vi } from "vitest"
import {
  Neuron,
  type NeuronContext,
  type NeuronPlugin,
  type NeuronSubscriberFN,
} from "./Neuron"
import { isNeuron } from "./utils/isNeuron"

describe("Neuron 根节点", () => {
  test("source 创建输入输出同型且持有 context 的 Neuron", () => {
    const source = Neuron.source<number>()
    const receivedSignals: Array<[number, number | undefined]> = []
    const subscriberFN = vi.fn(
      (output: number, context: NeuronContext<number>) => {
        receivedSignals.push([output, context.prev])
      },
    )

    expectTypeOf(source).toEqualTypeOf<Neuron<number, number>>()
    expect(source.context).toEqual({ prev: undefined })

    source.tick(0)
    const subscription = source.subscribe(subscriberFN)
    source.tick(1)
    subscription.unsubscribe()
    source.tick(2)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(receivedSignals).toEqual([[1, 0]])
    expect(source.context.prev).toBe(2)
  })

  test("相同 subscriber FN 的每次订阅都可以独立取消", () => {
    const source = Neuron.source<number>()
    const subscriberFN = vi.fn()
    const firstSubscription = source.subscribe(subscriberFN)
    const secondSubscription = source.subscribe(subscriberFN)

    source.tick(1)
    firstSubscription.unsubscribe()
    source.tick(2)
    secondSubscription.unsubscribe()
    source.tick(3)

    expect(subscriberFN).toHaveBeenCalledTimes(3)
    expect(subscriberFN.mock.calls.map(([output]) => output)).toEqual([1, 1, 2])
  })

  test("传播期间的订阅变化只影响下一次输出", () => {
    const source = Neuron.source<number>()
    const calls: string[] = []
    let stopSecond = () => {}

    source.subscribe(() => {
      calls.push("first")
      stopSecond()
      source.subscribe(() => calls.push("new"))
    })
    stopSecond = source.subscribe(() => calls.push("second")).unsubscribe

    source.tick(1)
    expect(calls).toEqual(["first", "second"])

    calls.length = 0
    source.tick(2)
    expect(calls).toEqual(["first", "new"])
  })
})

describe("Neuron 节点连接", () => {
  test("订阅转发 subscriber FN 后信号经过下游，取消后停止传播", () => {
    const source = Neuron.source<number>()
    const target = Neuron.source<number>()
    const targetSubscriberFN = vi.fn()

    target.subscribe(targetSubscriberFN)
    const subscription = source.subscribe((output) => target.tick(output))
    source.tick(1)
    subscription.unsubscribe()
    source.tick(2)

    expect(targetSubscriberFN).toHaveBeenCalledOnce()
    expect(targetSubscriberFN.mock.calls[0]?.[0]).toBe(1)
    expect(targetSubscriberFN.mock.calls[0]?.[1]).toBe(target.context)
  })

  test("同一 Neuron 的每次订阅都是可以独立取消的边", () => {
    const source = Neuron.source<number>()
    const target = Neuron.source<number>()
    const targetSubscriberFN = vi.fn()

    target.subscribe(targetSubscriberFN)
    const forwardToTarget = (output: number) => target.tick(output)
    const firstSubscription = source.subscribe(forwardToTarget)
    const secondSubscription = source.subscribe(forwardToTarget)
    source.tick(1)
    firstSubscription.unsubscribe()
    source.tick(2)
    secondSubscription.unsubscribe()
    source.tick(3)

    expect(targetSubscriberFN).toHaveBeenCalledTimes(3)
    expect(targetSubscriberFN.mock.calls.map(([output]) => output)).toEqual([
      1,
      1,
      2,
    ])
  })
})

describe("Neuron 派生节点", () => {
  test("deriveFrom 把 mapper 保存在新节点并转换以后经过的信号", () => {
    const source = Neuron.source<number>()
    const derived = Neuron.deriveFrom(source, (value) => `value:${value * 2}`)
    const subscriberFN = vi.fn()

    expectTypeOf(derived).toEqualTypeOf<Neuron<number, string>>()

    source.tick(1)
    derived.subscribe(subscriberFN)
    source.tick(2)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:4")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(derived.context)
  })

  test("派生节点的 tick 使用自身 mapper", () => {
    const source = Neuron.source<number>()
    const derived = Neuron.deriveFrom(source, (value) => `value:${value * 2}`)
    const subscriberFN = vi.fn()

    derived.subscribe(subscriberFN)
    derived.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:6")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(derived.context)
  })

  test("deriveFrom 可以连续组成不同输入输出类型的数据管道", () => {
    const source = Neuron.source<number>()
    const doubled = Neuron.deriveFrom(source, (value) => value * 2)
    const text = Neuron.deriveFrom(doubled, (value) => `value:${value + 1}`)
    const subscriberFN = vi.fn()

    expectTypeOf(text).toEqualTypeOf<Neuron<number, string>>()

    text.subscribe(subscriberFN)
    source.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:7")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(text.context)
  })
})

describe("Neuron context", () => {
  test("Neuron 持有同一个 context，并在每次 tick 后推进 prev", () => {
    const source = Neuron.source<number>()
    const receivedSignals: Array<{
      output: number
      prev: number | undefined
      context: NeuronContext<number>
    }> = []

    source.subscribe((output, context) => {
      receivedSignals.push({ output, prev: context.prev, context })
    })
    source.tick(1)
    source.tick(2)
    source.tick(3)

    expect(receivedSignals.map(({ output, prev }) => [output, prev])).toEqual([
      [1, undefined],
      [2, 1],
      [3, 2],
    ])
    expect(receivedSignals.every(({ context }) => context === source.context)).toBe(
      true,
    )
    expect(source.context.prev).toBe(3)
  })

  test("派生节点持有自己的 context，不继承 source context", () => {
    const source = Neuron.source<number>()
    const derived = Neuron.deriveFrom(source, (value) => `value:${value * 2}`)
    const sourceSignals: Array<[number, number | undefined]> = []
    const derivedSignals: Array<[string, string | undefined]> = []

    source.subscribe((output, context) => {
      sourceSignals.push([output, context.prev])
    })
    derived.subscribe((output, context) => {
      derivedSignals.push([output, context.prev])
    })
    source.tick(1)
    source.tick(2)

    expect(source.context).not.toBe(derived.context)
    expect(sourceSignals).toEqual([
      [1, undefined],
      [2, 1],
    ])
    expect(derivedSignals).toEqual([
      ["value:2", undefined],
      ["value:4", "value:2"],
    ])
  })

  test("插件字段保存在同一个 context 中，并会跨 tick 保留", () => {
    const source = Neuron.source<number>()
    const plugin: NeuronPlugin<number, number> = {
      install() {},
      refineContext(output, context) {
        const tickCount =
          typeof context.tickCount === "number" ? context.tickCount : 0
        context.tickCount = tickCount + 1
        context.scaledOutput = output * 10
      },
    }
    const receivedSignals: Array<{
      output: number
      prev: number | undefined
      tickCount: unknown
      scaledOutput: unknown
      context: NeuronContext<number>
    }> = []

    Neuron.loadPlugin({ to: source, plugins: [plugin] })
    source.subscribe((output, context) => {
      receivedSignals.push({
        output,
        prev: context.prev,
        tickCount: context.tickCount,
        scaledOutput: context.scaledOutput,
        context,
      })
    })
    source.tick(3)
    source.tick(4)

    expect(
      receivedSignals.map(({ output, prev, tickCount, scaledOutput }) => [
        output,
        prev,
        tickCount,
        scaledOutput,
      ]),
    ).toEqual([
      [3, undefined, 1, 30],
      [4, 3, 2, 40],
    ])
    expect(receivedSignals[0]?.context).toBe(source.context)
    expect(receivedSignals[1]?.context).toBe(source.context)
    expect(source.context).toEqual({
      prev: 4,
      tickCount: 2,
      scaledOutput: 40,
    })
  })

  test("传播中抛错也会把 context.prev 推进到本次 output", () => {
    const source = Neuron.source<number>()

    source.subscribe(() => {
      throw new Error("stop propagation")
    })

    expect(() => source.tick(1)).toThrow("stop propagation")
    expect(source.context.prev).toBe(1)
  })
})

describe("Neuron 插件装载", () => {
  test("插件可以通过公开扩展面增强 mapper", () => {
    const source = Neuron.source<number>()
    const plugin: NeuronPlugin<number, number> = {
      install(neuron) {
        const mapper = neuron.mapper
        neuron.mapper = (input) => mapper(input) * 2
      },
    }
    const subscriberFN = vi.fn()

    Neuron.loadPlugin({ to: source, plugins: [plugin] })
    source.subscribe(subscriberFN)
    source.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe(6)
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(source.context)
  })

  test("loadPlugin 是运行时唯一装载入口，同一插件实例只装载一次", () => {
    const source = Neuron.source<number>()
    const derived = Neuron.deriveFrom(source, (value) => `value:${value * 2}`)
    const observedOutputs: string[] = []
    const plugin: NeuronPlugin<number, string> = {
      install: vi.fn((neuron) => {
        neuron.subscribe((output) => observedOutputs.push(output))
      }),
    }

    source.tick(1)
    expect(Neuron.loadPlugin({ to: derived, plugins: [plugin] })).toBe(derived)
    source.tick(2)
    Neuron.loadPlugin({ to: derived, plugins: [plugin] })
    source.tick(3)

    expect(plugin.install).toHaveBeenCalledOnce()
    expect(observedOutputs).toEqual(["value:4", "value:6"])
  })

  test("插件可以包装 subscribe，而 Neuron 不解释 subscriber FN 的来源", () => {
    const source = Neuron.source<number>()
    const observedSubscriberFNs: NeuronSubscriberFN<number>[] = []
    const plugin: NeuronPlugin<number, number> = {
      install(neuron) {
        const subscribe = neuron.subscribe
        neuron.subscribe = (subscriberFN) => {
          observedSubscriberFNs.push(subscriberFN)
          return subscribe(subscriberFN)
        }
      },
    }
    const subscriberFN = vi.fn()

    Neuron.loadPlugin({ to: source, plugins: [plugin] })
    const subscription = source.subscribe(subscriberFN)
    source.tick(1)
    subscription.unsubscribe()

    expect(observedSubscriberFNs).toEqual([subscriberFN])
    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe(1)
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(source.context)
  })
})

test("isNeuron 只接受 Neuron 实例", () => {
  expect(isNeuron(Neuron.source())).toBe(true)
  expect(isNeuron({ source: Neuron.source })).toBe(false)
  expect(isNeuron(null)).toBe(false)
})
