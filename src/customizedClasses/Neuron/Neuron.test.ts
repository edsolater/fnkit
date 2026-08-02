import { describe, expect, expectTypeOf, test, vi } from "vitest"
import {
  Neuron,
  type NeuronContext,
  type NeuronPlugin,
  type NeuronSubscriberFN,
} from "./Neuron"
import { isNeuron } from "./utils/isNeuron"

describe("Neuron 根节点", () => {
  test("source 创建原样接收 value 且持有 context 的 Neuron", () => {
    const source = Neuron.source<number>()
    const receivedSignals: Array<[number, NeuronContext]> = []
    const subscriberFN = vi.fn(
      (value: number, context: NeuronContext) => {
        receivedSignals.push([value, context])
      },
    )

    expectTypeOf(source).toEqualTypeOf<Neuron<number>>()
    expect(source.value).toBeUndefined()
    expect(source.context).toEqual({})

    source.tick(0)
    const subscription = source.subscribe(subscriberFN)
    source.tick(1)
    subscription.unsubscribe()
    source.tick(2)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(receivedSignals).toEqual([[1, source.context]])
    expect(source.value).toBe(2)
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
    expect(subscriberFN.mock.calls.map(([value]) => value)).toEqual([1, 1, 2])
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
    const subscription = source.subscribe((value) => target.tick(value))
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
    const forwardToTarget = (value: number) => target.tick(value)
    const firstSubscription = source.subscribe(forwardToTarget)
    const secondSubscription = source.subscribe(forwardToTarget)
    source.tick(1)
    firstSubscription.unsubscribe()
    source.tick(2)
    secondSubscription.unsubscribe()
    source.tick(3)

    expect(targetSubscriberFN).toHaveBeenCalledTimes(3)
    expect(targetSubscriberFN.mock.calls.map(([value]) => value)).toEqual([
      1,
      1,
      2,
    ])
  })
})

describe("Neuron 数据管线", () => {
  test("pipe 把 mapper 保存在下游节点并转换以后经过的信号", () => {
    const source = Neuron.source<number>()
    const mapperFN = vi.fn((value: number) => `value:${value * 2}`)
    const derived = source.pipe(mapperFN)
    const subscriberFN = vi.fn()

    expectTypeOf(derived).toEqualTypeOf<Neuron<string, number>>()
    expect(derived.mapper).toBe(mapperFN)
    expect(derived.value).toBeUndefined()

    source.tick(1)
    expect(mapperFN).toHaveBeenLastCalledWith(1, derived.context)
    expect(derived.value).toBe("value:2")
    derived.subscribe(subscriberFN)
    source.tick(2)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:4")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(derived.context)
    expect(derived.value).toBe("value:4")
  })

  test("派生节点的 tick 使用自身 mapper", () => {
    const source = Neuron.source<number>()
    const derived = source.pipe((value) => `value:${value * 2}`)
    const subscriberFN = vi.fn()

    derived.subscribe(subscriberFN)
    derived.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:6")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(derived.context)
    expect(derived.value).toBe("value:6")
  })

  test("pipe 可以连续组成不同 value 类型的数据管道", () => {
    const source = Neuron.source<number>()
    const doubled = source.pipe((value) => value * 2)
    const text = doubled.pipe((value) => `value:${value + 1}`)
    const subscriberFN = vi.fn()

    expectTypeOf(text).toEqualTypeOf<Neuron<string, number>>()

    text.subscribe(subscriberFN)
    source.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe("value:7")
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(text.context)
    expect(source.value).toBe(3)
    expect(doubled.value).toBe(6)
    expect(text.value).toBe("value:7")
  })
})

describe("Neuron context", () => {
  test("Neuron 持有同一个 context，并在每次 tick 后更新核心 value", () => {
    const source = Neuron.source<number>()
    const receivedSignals: Array<{
      value: number
      context: NeuronContext
    }> = []

    source.subscribe((value, context) => {
      receivedSignals.push({ value, context })
    })
    source.tick(1)
    source.tick(2)
    source.tick(3)

    expect(receivedSignals.map(({ value }) => value)).toEqual([1, 2, 3])
    expect(receivedSignals.every(({ context }) => context === source.context)).toBe(
      true,
    )
    expect(source.value).toBe(3)
    expect(source.context).toEqual({})
  })

  test("下游节点持有自己的 value 和 context", () => {
    const source = Neuron.source<number>()
    const derived = source.pipe((value) => `value:${value * 2}`)
    const sourceSignals: Array<[number, NeuronContext]> = []
    const derivedSignals: Array<[string, NeuronContext]> = []

    source.subscribe((value, context) => {
      sourceSignals.push([value, context])
    })
    derived.subscribe((value, context) => {
      derivedSignals.push([value, context])
    })
    source.tick(1)
    source.tick(2)

    expect(source.context).not.toBe(derived.context)
    expect(sourceSignals).toEqual([
      [1, source.context],
      [2, source.context],
    ])
    expect(derivedSignals).toEqual([
      ["value:2", derived.context],
      ["value:4", derived.context],
    ])
    expect(source.value).toBe(2)
    expect(derived.value).toBe("value:4")
  })

  test("插件字段保存在同一个 context 中，并会跨 tick 保留", () => {
    const source = Neuron.source<number>()
    const plugin: NeuronPlugin<number> = {
      install() {},
      refineContext(value, context) {
        const tickCount =
          typeof context.tickCount === "number" ? context.tickCount : 0
        context.tickCount = tickCount + 1
        context.scaledValue = value * 10
      },
    }
    const receivedSignals: Array<{
      value: number
      tickCount: unknown
      scaledValue: unknown
      context: NeuronContext
    }> = []

    Neuron.loadPlugin({ to: source, plugins: [plugin] })
    source.subscribe((value, context) => {
      receivedSignals.push({
        value,
        tickCount: context.tickCount,
        scaledValue: context.scaledValue,
        context,
      })
    })
    source.tick(3)
    source.tick(4)

    expect(
      receivedSignals.map(({ value, tickCount, scaledValue }) => [
        value,
        tickCount,
        scaledValue,
      ]),
    ).toEqual([
      [3, 1, 30],
      [4, 2, 40],
    ])
    expect(receivedSignals[0]?.context).toBe(source.context)
    expect(receivedSignals[1]?.context).toBe(source.context)
    expect(source.context).toEqual({
      tickCount: 2,
      scaledValue: 40,
    })
    expect(source.value).toBe(4)
  })

  test("传播中抛错也会保留本次核心 value", () => {
    const source = Neuron.source<number>()

    source.subscribe(() => {
      throw new Error("stop propagation")
    })

    expect(() => source.tick(1)).toThrow("stop propagation")
    expect(source.value).toBe(1)
  })
})

describe("Neuron 插件装载", () => {
  test("插件可以通过公开扩展面增强 mapper", () => {
    const source = Neuron.source<number>()
    const plugin: NeuronPlugin<number> = {
      install(neuron) {
        const mapper = neuron.mapper
        neuron.mapper = (value, context) => mapper(value, context) * 2
      },
    }
    const subscriberFN = vi.fn()

    Neuron.loadPlugin({ to: source, plugins: [plugin] })
    source.subscribe(subscriberFN)
    source.tick(3)

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscriberFN.mock.calls[0]?.[0]).toBe(6)
    expect(subscriberFN.mock.calls[0]?.[1]).toBe(source.context)
    expect(source.value).toBe(6)
  })

  test("loadPlugin 是运行时唯一装载入口，同一插件实例只装载一次", () => {
    const source = Neuron.source<number>()
    const derived = source.pipe((value) => `value:${value * 2}`)
    const observedValues: string[] = []
    const plugin: NeuronPlugin<string, number> = {
      install: vi.fn((neuron) => {
        neuron.subscribe((value) => observedValues.push(value))
      }),
    }

    source.tick(1)
    expect(Neuron.loadPlugin({ to: derived, plugins: [plugin] })).toBe(derived)
    source.tick(2)
    Neuron.loadPlugin({ to: derived, plugins: [plugin] })
    source.tick(3)

    expect(plugin.install).toHaveBeenCalledOnce()
    expect(observedValues).toEqual(["value:4", "value:6"])
  })

  test("插件可以包装 subscribe，而 Neuron 不解释 subscriber FN 的来源", () => {
    const source = Neuron.source<number>()
    const observedSubscriberFNs: NeuronSubscriberFN<number>[] = []
    const plugin: NeuronPlugin<number> = {
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
