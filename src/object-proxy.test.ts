/** ObjectProxy 领域的运行时和类型契约测试。 */
import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { hasProperty } from "./compare"
import {
  isObjectProxy,
  objectProxyBrand,
  objectProxyValuePromise,
  toObjectProxy,
  toPromiseFromObjectProxy,
  type ObjectProxy,
} from "./object-proxy"

interface Deferred<Value> {
  promise: Promise<Value>
  resolve: (value: Value) => void
}

/**
 * 创建一个由测试主动完成的 Promise。
 */
function createDeferred<Value>(): Deferred<Value> {
  let resolve!: (value: Value) => void
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

describe("ObjectProxy 类型", () => {
  test("属性、方法和方法结果都递归映射成 ObjectProxy", () => {
    const metadataKey = Symbol("metadata")

    interface Calculator {
      label: string
      metadata: {
        version: number
      }
      [metadataKey]: {
        enabled: boolean
      }
      add: (amount: number) => number
      load: () => Promise<{ count: number }>
    }

    const proxy = toObjectProxy(
      Promise.resolve<Calculator>({
        label: "calculator",
        metadata: { version: 1 },
        [metadataKey]: { enabled: true },
        add: (amount) => amount + 1,
        load: async () => ({ count: 2 }),
      }),
    )

    expectTypeOf(proxy).toEqualTypeOf<ObjectProxy<Calculator>>()
    expectTypeOf(proxy.label).toEqualTypeOf<ObjectProxy<string>>()
    expectTypeOf(proxy.metadata.version).toEqualTypeOf<ObjectProxy<number>>()
    expectTypeOf(proxy[metadataKey].enabled).toEqualTypeOf<ObjectProxy<boolean>>()
    expectTypeOf(proxy.add).toEqualTypeOf<ObjectProxy<(amount: number) => number>>()
    expectTypeOf(proxy.add(1)).toEqualTypeOf<ObjectProxy<number>>()
    expectTypeOf(proxy.load().count).toEqualTypeOf<ObjectProxy<number>>()
  })
})

describe("ObjectProxy symbol 协议", () => {
  test("分别公开包装身份和未经包装的原始 Promise", async () => {
    const object = {
      value: 7,
      brand: "business-brand",
      promise: "business-promise",
    }
    const objectPromise = Promise.resolve(object)
    const proxy = toObjectProxy(objectPromise)

    expectTypeOf(proxy[objectProxyBrand]).toEqualTypeOf<true>()
    expectTypeOf(proxy[objectProxyValuePromise]).toEqualTypeOf<Promise<typeof object>>()
    expect(proxy[objectProxyBrand]).toBe(true)
    expect(proxy[objectProxyValuePromise]).toBe(objectPromise)
    expect(hasProperty(proxy, objectProxyBrand)).toBe(true)
    expect(hasProperty(proxy, objectProxyValuePromise)).toBe(true)
    expect(isObjectProxy(proxy)).toBe(true)
    expect(isObjectProxy(proxy.value)).toBe(true)
    expect(isObjectProxy(object)).toBe(false)

    await expect(proxy).resolves.toBe(object)
    await expect(proxy[objectProxyValuePromise]).resolves.toBe(object)
    await expect(toPromiseFromObjectProxy(proxy)).resolves.toBe(object)
    await expect(proxy.value).resolves.toBe(7)
    await expect(toPromiseFromObjectProxy(proxy.value)).resolves.toBe(7)
  })

  test("普通值和拥有同名字符串字段的对象不会被识别为 ObjectProxy", () => {
    expect(isObjectProxy(undefined)).toBe(false)
    expect(isObjectProxy(null)).toBe(false)
    expect(isObjectProxy(1)).toBe(false)
    expect(
      isObjectProxy({
        value: 1,
        brand: true,
        promise: Promise.resolve(1),
      }),
    ).toBe(false)
  })
})

describe("ObjectProxy 传播", () => {
  test("对象尚未就绪时即可建立读取链", async () => {
    const deferred = createDeferred<{
      board: {
        highestTile: number
      }
    }>()
    const proxy = toObjectProxy(deferred.promise)
    const highestTile = proxy.board.highestTile

    deferred.resolve({
      board: {
        highestTile: 8,
      },
    })

    await expect(highestTile).resolves.toBe(8)
  })

  test("方法调用结果继续传播为 ObjectProxy", async () => {
    const proxy = toObjectProxy(
      Promise.resolve({
        createBoard: (highestTile: number) => ({
          statistics: {
            highestTile,
          },
        }),
      }),
    )

    await expect(proxy.createBoard(16).statistics.highestTile).resolves.toBe(16)
  })

  test("自动展开属性和方法返回的 Promise", async () => {
    const proxy = toObjectProxy(
      Promise.resolve({
        delayedValue: Promise.resolve({ count: 3 }),
        load: async () => ({ count: 4 }),
      }),
    )

    await expect(proxy.delayedValue.count).resolves.toBe(3)
    await expect(proxy.load().count).resolves.toBe(4)
  })

  test("透明读取 symbol、getter 和原始值公开的 key", async () => {
    const secretKey = Symbol("secret")
    const proxy = toObjectProxy(
      Promise.resolve({
        base: 3,
        get doubled(): number {
          return this.base * 2
        },
        label: "board",
        value: 2,
        [secretKey]: {
          enabled: true,
        },
      }),
    )

    await expect(proxy.doubled).resolves.toBe(6)
    await expect(proxy[secretKey].enabled).resolves.toBe(true)
    await expect(proxy.label.length).resolves.toBe(5)
    await expect(proxy.value.toFixed(2)).resolves.toBe("2.00")
  })

  test("直接调用方法时以拥有该 key 的真实对象作为 this", async () => {
    const object = {
      value: 2,
      multiply(factor: number): number {
        return this.value * factor
      },
    }
    const proxy = toObjectProxy(Promise.resolve(object))

    await expect(proxy.multiply(5)).resolves.toBe(10)
  })

  test("脱离对象调用方法时不秘密保留原对象作为 this", async () => {
    const object = {
      value: 2,
      readValue(this: { value: number } | undefined): number | undefined {
        return this?.value
      },
    }
    const proxy = toObjectProxy(Promise.resolve(object))
    const detachedMethod = proxy.readValue

    await expect(detachedMethod()).resolves.toBeUndefined()
  })

  test("每次调用都等待真实函数并原样传递参数", async () => {
    const deferred = createDeferred<{
      add: (left: number, right: number) => number
    }>()
    const add = vi.fn((left: number, right: number) => left + right)
    const proxy = toObjectProxy(deferred.promise)
    const result = proxy.add(2, 3)

    expect(add).not.toHaveBeenCalled()

    deferred.resolve({ add })

    await expect(result).resolves.toBe(5)
    expect(add).toHaveBeenCalledOnce()
    expect(add).toHaveBeenCalledWith(2, 3)
  })

  test("任意层级的代理都可以直接 await", async () => {
    const object = {
      nested: {
        value: 5,
      },
    }
    const proxy = toObjectProxy(Promise.resolve(object))

    await expect(proxy).resolves.toBe(object)
    await expect(proxy.nested).resolves.toBe(object.nested)
    await expect(proxy.nested.value).resolves.toBe(5)
  })

  test("以危险的 fire-and-forget 方式向真实 setter 透传赋值", async () => {
    const deferred = createDeferred<{
      storedValue: number
      value: number
    }>()
    let completeSet!: () => void
    const setCompleted = new Promise<void>((resolve) => {
      completeSet = resolve
    })
    const object = {
      storedValue: 0,
      set value(nextValue: number) {
        this.storedValue = nextValue
        completeSet()
      },
      get value(): number {
        return this.storedValue
      },
    }
    const proxy = toObjectProxy(deferred.promise)

    expect(Reflect.set(proxy as object, "value", 7)).toBe(true)
    expect(object.storedValue).toBe(0)

    deferred.resolve(object)
    await setCompleted

    expect(object.storedValue).toBe(7)
  })
})

describe("ObjectProxy 错误传播", () => {
  test("传播源 Promise 的拒绝", async () => {
    const proxy = toObjectProxy(Promise.reject<{ board: { value: number } }>(new Error("controller unavailable")))

    await expect(proxy.board.value).rejects.toThrow("controller unavailable")
  })

  test("传播属性读取异常和方法异常", async () => {
    const proxy = toObjectProxy(
      Promise.resolve({
        get brokenValue(): number {
          throw new Error("read failed")
        },
        run(): void {
          throw new Error("call failed")
        },
      }),
    )

    await expect(proxy.brokenValue).rejects.toThrow("read failed")
    await expect(proxy.run()).rejects.toThrow("call failed")
  })

  test("将非函数值作为函数调用时给出明确错误", async () => {
    const proxy = toObjectProxy(Promise.resolve({ value: 1 }))
    const callValue = proxy.value as unknown as () => ObjectProxy<unknown>

    await expect(callValue()).rejects.toThrow("ObjectProxy value is not callable")
  })
})

describe("toPromiseFromObjectProxy", () => {
  test("转换成解析代理当前值的原生 Promise", async () => {
    const object = {
      board: {
        highestTile: 32,
      },
    }
    const proxy = toObjectProxy(Promise.resolve(object))
    const objectPromise = toPromiseFromObjectProxy(proxy)
    const valuePromise = toPromiseFromObjectProxy(proxy.board.highestTile)

    expectTypeOf(objectPromise).toEqualTypeOf<Promise<typeof object>>()
    expectTypeOf(valuePromise).toEqualTypeOf<Promise<number>>()
    expect(objectPromise).toBeInstanceOf(Promise)
    expect(valuePromise).toBeInstanceOf(Promise)
    await expect(objectPromise).resolves.toBe(object)
    await expect(valuePromise).resolves.toBe(32)
  })

  test("传播代理当前值的拒绝", async () => {
    const proxy = toObjectProxy(Promise.reject<{ value: number }>(new Error("value unavailable")))

    await expect(toPromiseFromObjectProxy(proxy.value)).rejects.toThrow("value unavailable")
  })
})
