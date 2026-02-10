import { describe, test, expect } from "vitest"
import { find } from "./find"

describe("find()", () => {
  test("Array - 查找第一个匹配元素", () => {
    const result = find([1, 2, 3, 4], (v) => v > 2)
    expect(result).toBe(3)
  })

  test("Array - 未找到返回 undefined", () => {
    const result = find([1, 2, 3], (v) => v > 10)
    expect(result).toBeUndefined()
  })

  test("Array - 短路求值验证", () => {
    let count = 0
    const result = find([1, 2, 3, 4, 5], (v) => {
      count++
      return v > 2
    })
    expect(result).toBe(3)
    expect(count).toBe(3) // 只执行到第3个元素
  })

  test("Array - 使用 index 参数", () => {
    const result = find([10, 20, 30], (v, i) => i === 1)
    expect(result).toBe(20)
  })

  test("Set - 查找元素", () => {
    const result = find(new Set([1, 2, 3, 4]), (v) => v > 2)
    expect(result).toBe(3)
  })

  test("Set - 未找到", () => {
    const result = find(new Set([1, 2, 3]), (v) => v > 10)
    expect(result).toBeUndefined()
  })

  test("Set - 短路求值", () => {
    let count = 0
    const result = find(new Set([1, 2, 3, 4, 5]), (v) => {
      count++
      return v > 2
    })
    expect(result).toBe(3)
    expect(count).toBe(3)
  })

  test("Map - 查找值", () => {
    const result = find(
      new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]),
      (v) => v > 1,
    )
    expect(result).toBe(2)
  })

  test("Map - 使用 key 参数", () => {
    const result = find(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      (v, k) => k === "b",
    )
    expect(result).toBe(2)
  })

  test("Map - 未找到", () => {
    const result = find(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      (v) => v > 10,
    )
    expect(result).toBeUndefined()
  })

  test("Object - 查找值", () => {
    const result = find({ a: 1, b: 2, c: 3 }, (v) => v > 1)
    expect(result).toBe(2)
  })

  test("Object - 使用 key 参数", () => {
    const result = find({ a: 1, b: 2 }, (v, k) => k === "b")
    expect(result).toBe(2)
  })

  test("Object - 未找到", () => {
    const result = find({ a: 1, b: 2 }, (v) => v > 10)
    expect(result).toBeUndefined()
  })

  test("Iterable - 查找", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
      yield 4
    }

    const result = find(gen(), (v) => v > 2)
    expect(result).toBe(3)
  })

  test("性能 - 大数组短路", () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)
    let count = 0

    const result = find(largeArray, (v) => {
      count++
      return v === 100
    })

    expect(result).toBe(100)
    expect(count).toBe(101) // 短路求值，只执行 101 次
  })

  test("边界情况 - 空数组", () => {
    const result = find([], (v) => v > 0)
    expect(result).toBeUndefined()
  })

  test("边界情况 - 第一个元素匹配", () => {
    let count = 0
    const result = find([1, 2, 3], (v) => {
      count++
      return v === 1
    })
    expect(result).toBe(1)
    expect(count).toBe(1) // 只执行一次
  })
})
