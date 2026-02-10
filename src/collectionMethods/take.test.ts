import { describe, test, expect } from "vitest"
import { take } from "./take"

describe("take()", () => {
  test("Array - 保留前 n 个元素", () => {
    const result = take([1, 2, 3, 4, 5], 3)
    expect(result).toEqual([1, 2, 3])
    expect(Array.isArray(result)).toBe(true)
  })

  test("Array - 保留 0 个元素", () => {
    const result = take([1, 2, 3], 0)
    expect(result).toEqual([])
  })

  test("Array - 保留超过数组长度", () => {
    const result = take([1, 2, 3], 10)
    expect(result).toEqual([1, 2, 3])
  })

  test("Array - 大数组继承惰性", () => {
    const largeArray = Array.from({ length: 200 }, (_, i) => i)
    const result = take(largeArray, 50)

    // 访问时才执行
    const length = result.length
    expect(length).toBe(50)
  })

  test("Set - 保留前 n 个元素", () => {
    const result = take(new Set([1, 2, 3, 4, 5]), 3)
    expect(result).toEqual(new Set([1, 2, 3]))
    expect(result instanceof Set).toBe(true)
  })

  test("Set - 保留 0 个元素", () => {
    const result = take(new Set([1, 2, 3]), 0)
    expect(result).toEqual(new Set())
  })

  test("Set - 大集合惰性执行", () => {
    const largeSet = new Set(Array.from({ length: 200 }, (_, i) => i))
    const result = take(largeSet, 100)

    const size = result.size
    expect(size).toBe(100)
  })

  test("Map - 保留前 n 个条目", () => {
    const result = take(
      new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]),
      2,
    )
    expect(result).toEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    )
    expect(result instanceof Map).toBe(true)
  })

  test("Map - 保留所有元素", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    const result = take(map, 10)
    expect(result).toEqual(map)
  })

  test("Map - 大集合惰性执行", () => {
    const largeMap = new Map(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    const result = take(largeMap, 30)

    const size = result.size
    expect(size).toBe(30)
  })

  test("Object - 保留前 n 个属性", () => {
    const result = take({ a: 1, b: 2, c: 3, d: 4 }, 2)
    const keys = Object.keys(result)
    expect(keys.length).toBe(2)
  })

  test("Object - 保留 0 个属性", () => {
    const result = take({ a: 1, b: 2 }, 0)
    expect(Object.keys(result).length).toBe(0)
  })

  test("Object - 大对象惰性执行", () => {
    const largeObj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    const result = take(largeObj, 30)

    const keys = Object.keys(result)
    expect(keys.length).toBe(30)
  })

  test("Iterable - 返回迭代器", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
      yield 4
      yield 5
    }

    const result = take(gen(), 3)

    // 应该返回迭代器
    expect(typeof result[Symbol.iterator]).toBe("function")

    // 消费迭代器
    const values = Array.from(result)
    expect(values).toEqual([1, 2, 3])
  })

  test("链式操作 - take 后继续操作", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = take(arr, 5)
      .map((v) => v * 2)
      .filter((v) => v > 5)

    expect(result).toEqual([6, 8, 10])
  })

  test("语义验证 - 类似 slice(0, n)", () => {
    const arr = [1, 2, 3, 4, 5]
    const takeResult = take(arr, 3)
    const sliceResult = arr.slice(0, 3)

    expect(takeResult).toEqual(sliceResult)
  })
})
