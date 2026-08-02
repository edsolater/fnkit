import { describe, expect, test, vi } from "vitest"
import { Subscription } from "../customizedClasses/Subscription"
import { PluginSystem } from "../plugin-system"
import {
  isSubscribable,
  Subscribable,
  type SubscribablePluginChannels,
} from "./subscribable-dev"

describe("Subscribable 取值与写入", () => {
  test("value 保存惰性求值的结果，不保存函数", () => {
    const initialValueFN = vi.fn(() => 1)
    const subscribable = new Subscribable(initialValueFN)

    expect(initialValueFN).toHaveBeenCalledOnce()
    expect(subscribable.value).toBe(1)
  })

  test("set 只接受同步值和同步计算函数", () => {
    const subscribable = new Subscribable(1)

    subscribable.set((value) => value + 1)

    expect(subscribable.value).toBe(2)
  })

  test("最终转换值相同则跳过，force 可以强制写入", () => {
    const subscriberFN = vi.fn()
    const subscribable = new Subscribable(2, {
      refine: (value) => Math.abs(value),
    })
    subscribable.subscribe(subscriberFN, { immediately: false })

    subscribable.set(-2)
    subscribable.set(-2, { force: true })

    expect(subscriberFN).toHaveBeenCalledOnce()
    expect(subscribable.value).toBe(2)
  })

  test("equals 可以定义值相同的规则", () => {
    const subscriberFN = vi.fn()
    const subscribable = new Subscribable(
      { id: 1, label: "old" },
      { equals: (value, prev) => value.id === prev.id },
    )
    subscribable.subscribe(subscriberFN, { immediately: false })

    subscribable.set({ id: 1, label: "new" })

    expect(subscriberFN).not.toHaveBeenCalled()
    expect(subscribable.value).toEqual({ id: 1, label: "old" })
  })
})

describe("Subscribable 订阅", () => {
  test("subscriberFN 通过 context 获取 prev 和同一次写入的 version", () => {
    const subscribable = new Subscribable(1)
    const firstSubscriberFN = vi.fn()
    const secondSubscriberFN = vi.fn()

    subscribable.subscribe(firstSubscriberFN, { immediately: false })
    subscribable.subscribe(secondSubscriberFN, { immediately: false })
    subscribable.set(2)

    expect(firstSubscriberFN).toHaveBeenCalledWith(2, {
      prev: 1,
      version: 1,
    })
    expect(secondSubscriberFN).toHaveBeenCalledWith(2, {
      prev: 1,
      version: 1,
    })
  })

  test("默认立即交付 null 和 undefined", () => {
    const nullSubscriberFN = vi.fn()
    const undefinedSubscriberFN = vi.fn()

    new Subscribable<null>(null).subscribe(nullSubscriberFN)
    new Subscribable<undefined>(undefined).subscribe(undefinedSubscriberFN)

    expect(nullSubscriberFN).toHaveBeenCalledWith(null, {
      prev: undefined,
      version: 0,
    })
    expect(undefinedSubscriberFN).toHaveBeenCalledWith(undefined, {
      prev: undefined,
      version: 0,
    })
  })

  test("subscribe 返回现有 Subscription，once 的立即交付算第一次", () => {
    const subscribable = new Subscribable(1)
    const subscriberFN = vi.fn()

    const subscription = subscribable.subscribe(subscriberFN, { once: true })
    subscribable.set(2)

    expect(subscription).toBeInstanceOf(Subscription)
    expect(subscription.closed).toBe(true)
    expect(subscriberFN).toHaveBeenCalledOnce()
  })

  test("下一次交付、取消订阅和 once 都会执行 subscriberFN 的清理", () => {
    const subscribable = new Subscribable(1)
    const cleanupFN = vi.fn()
    const subscription = subscribable.subscribe(() => cleanupFN, {
      immediately: false,
    })

    subscribable.set(2)
    subscribable.set(3)
    subscription.unsubscribe()

    expect(cleanupFN).toHaveBeenCalledTimes(2)
  })

  test("相同 key 会关闭旧 Subscription 并执行清理", () => {
    const subscribable = new Subscribable(1)
    const cleanupFN = vi.fn()
    const firstSubscription = subscribable.subscribe(() => cleanupFN, {
      key: "same",
    })

    const lastSubscription = subscribable.subscribe(vi.fn(), {
      key: "same",
      immediately: false,
    })

    expect(firstSubscription.closed).toBe(true)
    expect(lastSubscription.closed).toBe(false)
    expect(cleanupFN).toHaveBeenCalledOnce()
  })

  test("广播期间新增的订阅从下一次写入生效，已取消的订阅不再执行", () => {
    const subscribable = new Subscribable(1)
    const addedSubscriberFN = vi.fn()
    const cancelledSubscriberFN = vi.fn()
    let cancelledSubscription: Subscription | undefined

    subscribable.subscribe(
      () => {
        subscribable.subscribe(addedSubscriberFN, { immediately: false })
        cancelledSubscription?.unsubscribe()
      },
      { immediately: false },
    )
    cancelledSubscription = subscribable.subscribe(cancelledSubscriberFN, {
      immediately: false,
    })

    subscribable.set(2)
    expect(addedSubscriberFN).not.toHaveBeenCalled()
    expect(cancelledSubscriberFN).not.toHaveBeenCalled()

    subscribable.set(3)
    expect(addedSubscriberFN).toHaveBeenCalledOnce()
  })
})

describe("Subscribable 插件", () => {
  test("beforeSet 插件按装载顺序转换，实例 refine 最后处理", () => {
    const addOnePlugin = PluginSystem.createPlugin<SubscribablePluginChannels<number>>({
      beforeSet: (value) => value + 1,
    })
    const doublePlugin = PluginSystem.createPlugin<SubscribablePluginChannels<number>>({
      beforeSet: (value) => value * 2,
    })
    const subscribable = new Subscribable(0, {
      plugins: [addOnePlugin, doublePlugin],
      refine: (value) => value - 3,
    })

    subscribable.set(2)

    expect(subscribable.value).toBe(3)
  })

  test("运行时装载只影响后续写入，重复装载会重复追加 wrapper", () => {
    const beforeSetWrapper = vi.fn((value: number) => value * 2)
    const plugin = PluginSystem.createPlugin<SubscribablePluginChannels<number>>({
      beforeSet: beforeSetWrapper,
    })
    const subscribable = new Subscribable(1)

    subscribable.set(2)
    subscribable.load(plugin)
    subscribable.load(plugin)
    subscribable.set(3)

    expect(beforeSetWrapper).toHaveBeenCalledTimes(2)
    expect(subscribable.value).toBe(12)
    expect(subscribable.loadedPlugins).toBe(
      subscribable.pluginSystem.loadedPlugins,
    )
    expect(subscribable.loadedPlugins).toEqual([plugin, plugin])
  })
})

describe("Subscribable 派生与销毁", () => {
  test("deriveFrom 创建持续跟随 source 的 Subscribable", () => {
    const source = new Subscribable(2)
    const derived = Subscribable.deriveFrom(
      source,
      (value) => `value:${value * 2}`,
    )

    source.set(3)
    expect(derived.value).toBe("value:6")

    derived.destroy()
    source.set(4)
    expect(derived.value).toBe("value:6")
  })

  test("onDestroy 返回可以撤销登记的 Subscription", () => {
    const subscribable = new Subscribable(1)
    const cleanupFN = vi.fn()

    const subscription = subscribable.onDestroy(cleanupFN)
    subscription.unsubscribe()
    subscribable.destroy()

    expect(subscription.closed).toBe(true)
    expect(cleanupFN).not.toHaveBeenCalled()
  })

  test("destroy 结束生命周期，保留最后值并拒绝后续操作", () => {
    const subscribable = new Subscribable(1)
    const subscriberCleanupFN = vi.fn()
    const destroyCleanupFN = vi.fn()

    subscribable.subscribe(() => subscriberCleanupFN)
    subscribable.onDestroy(destroyCleanupFN)
    subscribable.destroy()
    subscribable.destroy()

    expect(subscribable.closed).toBe(true)
    expect(subscribable.value).toBe(1)
    expect(subscriberCleanupFN).toHaveBeenCalledOnce()
    expect(destroyCleanupFN).toHaveBeenCalledOnce()
    expect(() => subscribable.set(2)).toThrow("Subscribable 已经销毁")
    expect(() => subscribable.subscribe(vi.fn())).toThrow(
      "Subscribable 已经销毁",
    )
  })

  test("一个销毁动作失败时仍会执行其他销毁动作", () => {
    const subscribable = new Subscribable(1)
    const failedCleanupFN = vi.fn(() => {
      throw new Error("cleanup failed")
    })
    const completedCleanupFN = vi.fn()

    subscribable.onDestroy(failedCleanupFN)
    subscribable.onDestroy(completedCleanupFN)

    expect(() => subscribable.destroy()).toThrow("cleanup failed")
    expect(completedCleanupFN).toHaveBeenCalledOnce()
  })
})

test("isSubscribable 识别 class 实例", () => {
  expect(isSubscribable(new Subscribable(1))).toBe(true)
  expect(isSubscribable({ value: 1 })).toBe(false)
})
