import { expect, test, describe } from "vitest"
import { filter } from "./filter"

describe("filter()", () => {
  test("Array - 小数组立即执行", () => {
    const result = filter([1, 2, 3, 4], (v) => v % 2 === 0)
    expect(result).toEqual([2, 4])
    expect(Array.isArray(result)).toBe(true)
  })

  test("Array - 大数组惰性执行", () => {
    const largeArray = Array.from({ length: 200 }, (_, i) => i)
    let executionCount = 0

    const result = filter(largeArray, (v) => {
      executionCount++
      return v % 2 === 0
    })

    // 返回 Proxy，还未执行
    expect(executionCount).toBe(0)

    // 访问属性时才执行
    const length = result.length
    expect(executionCount).toBe(200)
    expect(length).toBe(100)
  })

  test("Array - 使用 index 参数", () => {
    const result = filter([10, 20, 30, 40], (v, i) => i >= 2)
    expect(result).toEqual([30, 40])
  })

  test("Set - 小集合立即执行", () => {
    const result = filter(new Set([1, 2, 3, 4]), (v) => v > 2)
    expect(result).toEqual(new Set([3, 4]))
    expect(result instanceof Set).toBe(true)
  })

  test("Set - 大集合惰性执行", () => {
    const largeSet = new Set(Array.from({ length: 200 }, (_, i) => i))
    let executionCount = 0

    const result = filter(largeSet, (v) => {
      executionCount++
      return v % 2 === 0
    })

    expect(executionCount).toBe(0)
    const size = result.size
    expect(executionCount).toBe(200)
    expect(size).toBe(100)
  })

  test("Map - 小集合立即执行", () => {
    const result = filter(
      new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]),
      (v) => v > 1,
    )
    expect(result).toEqual(
      new Map([
        ["b", 2],
        ["c", 3],
      ]),
    )
  })

  test("Map - 大集合惰性执行", () => {
    const largeMap = new Map(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    let executionCount = 0

    const result = filter(largeMap, (v) => {
      executionCount++
      return v % 2 === 0
    })

    expect(executionCount).toBe(0)
    const size = result.size
    expect(executionCount).toBe(100)
    expect(size).toBe(50)
  })

  test("Map - 使用 key 参数", () => {
    const result = filter(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      (v, k) => k === "a",
    )
    expect(result).toEqual(new Map([["a", 1]]))
  })

  test("Object - 小对象立即执行", () => {
    const result = filter({ a: 1, b: 2, c: 3 }, (v) => v > 1)
    expect(result).toEqual({ b: 2, c: 3 })
  })

  test("Object - 大对象惰性执行", () => {
    const largeObj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    let executionCount = 0

    const result = filter(largeObj, (v) => {
      executionCount++
      return v % 2 === 0
    })

    expect(executionCount).toBe(0)
    const keys = Object.keys(result)
    expect(executionCount).toBe(100)
    expect(keys.length).toBe(50)
  })

  test("Object - 使用 key 参数", () => {
    const result = filter({ a: 1, b: 2 }, (v, k) => k === "a")
    expect(result).toEqual({ a: 1 })
  })

  test("Iterable - 返回迭代器", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
      yield 4
    }

    const result = filter(gen(), (v) => v % 2 === 0)

    // 应该返回迭代器
    expect(typeof result[Symbol.iterator]).toBe("function")

    // 消费迭代器
    const values = [...(result as any)]
    expect(values).toEqual([2, 4])
  })

  test("性能对比 - 大数组", () => {
    const source = Array.from({ length: 100000 }, (_, idx) => idx + 1)

    console.time("原生 array.filter")
    const native = source.filter((v) => v % 2)
    console.timeEnd("原生 array.filter")

    console.time("filter 函数（惰性）")
    const custom = filter(source, (v) => v % 2)
    console.timeEnd("filter 函数（惰性）")

    console.time("访问结果")
    const length = custom.length
    console.timeEnd("访问结果")

    expect(length).toBe(native.length)
  })
})
