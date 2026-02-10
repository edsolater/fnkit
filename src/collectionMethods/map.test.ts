import { describe, test, expect } from "vitest"
import { map } from "./map"

describe("map()", () => {
  test("Array - 小数组立即执行", () => {
    const result = map([1, 2, 3], (v) => v * 2)
    expect(result).toEqual([2, 4, 6])
    expect(Array.isArray(result)).toBe(true)
  })

  test("Array - 大数组惰性执行", () => {
    const largeArray = Array.from({ length: 200 }, (_, i) => i)
    let executionCount = 0

    const result = map(largeArray, (v) => {
      executionCount++
      return v * 2
    })

    // 返回 Proxy，还未执行
    expect(executionCount).toBe(0)

    // 访问属性时才执行
    const first = result[0]
    expect(executionCount).toBe(200)
    expect(first).toBe(0)
  })

  test("Array - 使用 index 参数", () => {
    const result = map([10, 20, 30], (v, i) => v + i)
    expect(result).toEqual([10, 21, 32])
  })

  test("Set - 小集合立即执行", () => {
    const result = map(new Set([1, 2, 3]), (v) => v * 2)
    expect(result).toEqual(new Set([2, 4, 6]))
    expect(result instanceof Set).toBe(true)
  })

  test("Set - 大集合惰性执行", () => {
    const largeSet = new Set(Array.from({ length: 200 }, (_, i) => i))
    let executionCount = 0

    const result = map(largeSet, (v) => {
      executionCount++
      return v * 2
    })

    expect(executionCount).toBe(0)
    const size = result.size
    expect(executionCount).toBe(200)
    expect(size).toBe(200)
  })

  test("Map - 小集合立即执行", () => {
    const result = map(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      (v) => v * 2,
    )
    expect(result).toEqual(
      new Map([
        ["a", 2],
        ["b", 4],
      ]),
    )
  })

  test("Map - 大集合惰性执行", () => {
    const largeMap = new Map(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    let executionCount = 0

    const result = map(largeMap, (v) => {
      executionCount++
      return v * 2
    })

    expect(executionCount).toBe(0)
    const size = result.size
    expect(executionCount).toBe(100)
  })

  test("Map - 使用 key 参数", () => {
    const result = map(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      (v, k) => `${k}:${v}`,
    )
    expect(result).toEqual(
      new Map([
        ["a", "a:1"],
        ["b", "b:2"],
      ]),
    )
  })

  test("Object - 小对象立即执行", () => {
    const result = map({ a: 1, b: 2, c: 3 }, (v) => v * 2)
    expect(result).toEqual({ a: 2, b: 4, c: 6 })
  })

  test("Object - 大对象惰性执行", () => {
    const largeObj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    let executionCount = 0

    const result = map(largeObj, (v) => {
      executionCount++
      return v * 2
    })

    expect(executionCount).toBe(0)
    const keys = Object.keys(result)
    expect(executionCount).toBe(100)
    expect(keys.length).toBe(100)
  })

  test("Object - 使用 key 参数", () => {
    const result = map({ a: 1, b: 2 }, (v, k) => `${k}:${v}`)
    expect(result).toEqual({ a: "a:1", b: "b:2" })
  })

  test("Iterable - 返回迭代器", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
    }

    const result = map(gen(), (v) => v * 2)

    // 应该返回迭代器
    expect(typeof result[Symbol.iterator]).toBe("function")

    // 消费迭代器
    const values = Array.from(result)
    expect(values).toEqual([2, 4, 6])
  })

  test("链式操作 - map 后继续操作", () => {
    const arr = [1, 2, 3, 4, 5]
    const result = map(arr, (v) => v * 2)
      .filter((v) => v > 5)
      .map((v) => v + 1)

    expect(result).toEqual([7, 9, 11])
  })

  test("性能对比 - 大数组", () => {
    const source = Array.from({ length: 100000 }, (_, idx) => idx)

    console.time("原生 array.map")
    const native = source.map((v) => v * 2)
    console.timeEnd("原生 array.map")

    console.time("map 函数（惰性）")
    const custom = map(source, (v) => v * 2)
    console.timeEnd("map 函数（惰性）")

    console.time("访问结果")
    const length = custom.length
    console.timeEnd("访问结果")

    expect(length).toBe(native.length)
  })
})
