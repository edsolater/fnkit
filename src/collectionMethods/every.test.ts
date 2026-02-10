import { describe, test, expect } from "vitest"
import { every } from "./every"

describe("every()", () => {
  test("Array - 所有匹配返回 true", () => {
    const result = every([1, 2, 3], (v) => v > 0)
    expect(result).toBe(true)
  })

  test("Array - 有不匹配返回 false", () => {
    const result = every([1, 2, 3], (v) => v > 1)
    expect(result).toBe(false)
  })

  test("Array - 短路求值验证", () => {
    let count = 0
    const result = every([1, 2, 3, 4, 5], (v) => {
      count++
      return v < 3
    })
    expect(result).toBe(false)
    expect(count).toBe(3) // 遇到 false 就停止
  })

  test("Array - 使用 index 参数", () => {
    const result = every([10, 20, 30], (v, i) => i < 10)
    expect(result).toBe(true)
  })

  test("Set - 所有匹配", () => {
    expect(every(new Set([1, 2, 3]), (v) => v > 0)).toBe(true)
  })

  test("Set - 有不匹配", () => {
    expect(every(new Set([1, 2, 3]), (v) => v > 1)).toBe(false)
  })

  test("Set - 短路求值", () => {
    let count = 0
    const result = every(new Set([1, 2, 3, 4, 5]), (v) => {
      count++
      return v < 3
    })
    expect(result).toBe(false)
    expect(count).toBe(3)
  })

  test("Map - 所有匹配", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ])
    expect(every(map, (v) => v > 0)).toBe(true)
  })

  test("Map - 有不匹配", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    expect(every(map, (v) => v > 1)).toBe(false)
  })

  test("Map - 使用 key 参数", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    expect(every(map, (v, k) => typeof k === "string")).toBe(true)
  })

  test("Object - 所有匹配", () => {
    expect(every({ a: 1, b: 2, c: 3 }, (v) => v > 0)).toBe(true)
  })

  test("Object - 有不匹配", () => {
    expect(every({ a: 1, b: 2 }, (v) => v > 1)).toBe(false)
  })

  test("Object - 使用 key 参数", () => {
    expect(every({ a: 1, b: 2 }, (v, k) => typeof k === "string")).toBe(true)
  })

  test("Iterable - 检查", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
    }

    expect(every(gen(), (v) => v > 0)).toBe(true)
  })

  test("性能 - 大数组短路", () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)
    let count = 0

    const result = every(largeArray, (v) => {
      count++
      return v < 100
    })

    expect(result).toBe(false)
    expect(count).toBe(101) // 遇到 100 就停止
  })

  test("边界情况 - 空数组", () => {
    const result = every([], (v) => v > 0)
    expect(result).toBe(true) // 空数组 every 返回 true
  })

  test("边界情况 - 第一个元素不匹配", () => {
    let count = 0
    const result = every([1, 2, 3], (v) => {
      count++
      return v > 1
    })
    expect(result).toBe(false)
    expect(count).toBe(1) // 只执行一次
  })

  test("边界情况 - 全部匹配", () => {
    let count = 0
    const result = every([1, 2, 3], (v) => {
      count++
      return true
    })
    expect(result).toBe(true)
    expect(count).toBe(3) // 必须检查所有元素
  })
})
