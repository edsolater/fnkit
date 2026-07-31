import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { EventEmitter } from "./EventEmitter"

type TestEvents = {
  changed: [value: number, source: string]
  closed: []
  reset: [reason: string]
}

describe("EventEmitter 事件派发", () => {
  test("emit 把参数元组同步传给对应事件的 listener", () => {
    const emitter = new EventEmitter<TestEvents>()
    const received: unknown[][] = []

    emitter.on("changed", (value, source) => {
      expectTypeOf(value).toEqualTypeOf<number>()
      expectTypeOf(source).toEqualTypeOf<string>()
      received.push([value, source])
    })

    expect(emitter.emit("changed", [3, "user"])).toBe(true)
    expect(received).toEqual([[3, "user"]])
    expect(emitter.emit("closed", [])).toBe(false)
  })

  test("按注册顺序调用 listener", () => {
    const emitter = new EventEmitter<TestEvents>()
    const calls: string[] = []

    emitter.on("closed", () => calls.push("first"))
    emitter.on("closed", () => calls.push("second"))

    emitter.emit("closed", [])

    expect(calls).toEqual(["first", "second"])
  })

  test("调用 listener 时不暴露内部对象作为 this", () => {
    const emitter = new EventEmitter<TestEvents>()
    let listenerThis: unknown = null

    emitter.on("closed", function (this: void) {
      listenerThis = this
    })

    emitter.emit("closed", [])

    expect(listenerThis).toBeUndefined()
  })

  test("listener 抛出异常后停止本次同步派发", () => {
    const emitter = new EventEmitter<TestEvents>()
    const laterListener = vi.fn()

    emitter.on("closed", () => {
      throw new Error("listener failed")
    })
    emitter.on("closed", laterListener)

    expect(() => emitter.emit("closed", [])).toThrow("listener failed")
    expect(laterListener).not.toHaveBeenCalled()
  })
})

describe("EventEmitter 订阅生命周期", () => {
  test("相同 listener 的每次订阅都可以独立取消", () => {
    const emitter = new EventEmitter<TestEvents>()
    const listener = vi.fn()
    const firstSubscription = emitter.on("closed", listener)
    const secondSubscription = emitter.on("closed", listener)

    expect(firstSubscription.closed).toBe(false)
    expect(secondSubscription.closed).toBe(false)

    emitter.emit("closed", [])
    expect(listener).toHaveBeenCalledTimes(2)

    firstSubscription.unsubscribe()
    firstSubscription.unsubscribe()
    expect(firstSubscription.closed).toBe(true)
    expect(secondSubscription.closed).toBe(false)

    emitter.emit("closed", [])
    expect(listener).toHaveBeenCalledTimes(3)

    secondSubscription.unsubscribe()
    expect(emitter.emit("closed", [])).toBe(false)
  })

  test("once 选项在调用 listener 前取消订阅，递归派发不会再次调用", () => {
    const emitter = new EventEmitter<TestEvents>()
    const received: number[] = []

    const subscription = emitter.on(
      "changed",
      (value) => {
        expect(subscription.closed).toBe(true)
        received.push(value)
        emitter.emit("changed", [value + 1, "recursive"])
      },
      { once: true },
    )

    expect(subscription.closed).toBe(false)
    expect(emitter.emit("changed", [1, "initial"])).toBe(true)
    expect(subscription.closed).toBe(true)
    expect(received).toEqual([1])
    expect(emitter.emit("changed", [3, "later"])).toBe(false)
  })

  test("once 选项的 listener 抛出异常后仍然保持已取消", () => {
    const emitter = new EventEmitter<TestEvents>()

    emitter.on(
      "closed",
      () => {
        throw new Error("listener failed")
      },
      { once: true },
    )

    expect(() => emitter.emit("closed", [])).toThrow("listener failed")
    expect(emitter.emit("closed", [])).toBe(false)
  })
})

describe("EventEmitter 派发快照", () => {
  test("派发期间增删 listener 不改变当前快照", () => {
    const emitter = new EventEmitter<TestEvents>()
    const calls: string[] = []
    let unsubscribeSecond = () => {}

    emitter.on("closed", () => {
      calls.push("first")
      unsubscribeSecond()
      emitter.on("closed", () => calls.push("new"))
    })

    unsubscribeSecond = emitter.on("closed", () => calls.push("second")).unsubscribe

    emitter.emit("closed", [])

    expect(calls).toEqual(["first", "second"])
  })
})

describe("EventEmitter 批量取消", () => {
  test("removeAllListeners(eventName) 只取消指定事件", () => {
    const emitter = new EventEmitter<TestEvents>()
    const changedListener = vi.fn()
    const resetListener = vi.fn()

    emitter.on("changed", changedListener)
    emitter.on("reset", resetListener)
    emitter.removeAllListeners("changed")

    expect(emitter.emit("changed", [1, "user"])).toBe(false)
    expect(emitter.emit("reset", ["manual"])).toBe(true)
    expect(changedListener).not.toHaveBeenCalled()
    expect(resetListener).toHaveBeenCalledWith("manual")
  })

  test("removeAllListeners() 取消所有事件，之后仍可重新订阅", () => {
    const emitter = new EventEmitter<TestEvents>()
    const oldListener = vi.fn()
    const newListener = vi.fn()
    const oldSubscription = emitter.on("closed", oldListener)

    emitter.on("reset", oldListener)
    emitter.removeAllListeners()

    expect(oldSubscription.closed).toBe(true)
    expect(emitter.emit("closed", [])).toBe(false)
    expect(emitter.emit("reset", ["manual"])).toBe(false)

    oldSubscription.unsubscribe()
    emitter.on("closed", newListener)

    expect(emitter.emit("closed", [])).toBe(true)
    expect(oldListener).not.toHaveBeenCalled()
    expect(newListener).toHaveBeenCalledOnce()
  })
})
