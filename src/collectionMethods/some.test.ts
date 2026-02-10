import { describe, test, expect } from "vitest"
import { some } from "./some"

describe("some()", () => {
  test("Array - 有匹配返回 true", () => {
    const result = some([1, 2, 3], (v) => v > 2)
    expect(result).toBe(true)
  })

  test("Array - 无匹配返回 false", () => {
    const result = some([1, 2, 3], (v) => v > 10)
    expect(result).toBe(false)
  })

  test("Array - 短路求值验证", () => {
    let count = 0
    const result = some([1, 2, 3, 4, 5], (v) => {
      count++
      return v > 2
    })
    expect(result).toBe(true)
    expect(count).toBe(3) // 找到匹配就停止
  })

  test("Array - 使用 index 参数", () => {
    const result = some([10, 20, 30], (v, i) => i === 1)
    expect(result).toBe(true)
  })

  test("Set - 有匹配", () => {
    expect(some(new Set([1, 2, 3]), (v) => v > 2)).toBe(true)
  })

  test("Set - 无匹配", () => {
    expect(some(new Set([1, 2, 3]), (v) => v > 10)).toBe(false)
  })

  test("Set - 短路求值", () => {
    let count = 0
    const result = some(new Set([1, 2, 3, 4, 5]), (v) => {
      count++
      return v > 2
    })
    expect(result).toBe(true)
    expect(count).toBe(3)
  })

  test("Map - 有匹配", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ])
    expect(some(map, (v) => v > 2)).toBe(true)
  })

  test("Map - 无匹配", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    expect(some(map, (v) => v > 10)).toBe(false)
  })

  test("Map - 使用 key 参数", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    expect(some(map, (v, k) => k === "b")).toBe(true)
  })

  test("Object - 有匹配", () => {
    expect(some({ a: 1, b: 2, c: 3 }, (v) => v > 2)).toBe(true)
  })

  test("Object - 无匹配", () => {
    expect(some({ a: 1, b: 2 }, (v) => v > 10)).toBe(false)
  })

  test("Object - 使用 key 参数", () => {
    expect(some({ a: 1, b: 2 }, (v, k) => k === "b")).toBe(true)
  })

  test("Iterable - 检查", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
    }

    expect(some(gen(), (v) => v > 2)).toBe(true)
  })

  test("性能 - 大数组短路", () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)
    let count = 0

    const result = some(largeArray, (v) => {
      count++
      return v > 100
    })

    expect(result).toBe(true)
    expect(count).toBe(102) // 找到 101 就停止
  })

  test("边界情况 - 空数组", () => {
    const result = some([], (v) => v > 0)
    expect(result).toBe(false)
  })

  test("边界情况 - 第一个元素匹配", () => {
    let count = 0
    const result = some([1, 2, 3], (v) => {
      count++
      return v === 1
    })
    expect(result).toBe(true)
    expect(count).toBe(1) // 只执行一次
  })

  test("边界情况 - 全部不匹配", () => {
    let count = 0
    const result = some([1, 2, 3], (v) => {
      count++
      return false
    })
    expect(result).toBe(false)
    expect(count).toBe(3) // 必须检查所有元素
  })
})
