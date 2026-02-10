import { describe, test, expect } from "vitest"
import { reduce } from "./reduce"

describe("reduce()", () => {
  test("Array - 归约求和", () => {
    const result = reduce([1, 2, 3, 4], (acc, v) => acc + v, 0)
    expect(result).toBe(10)
  })

  test("Array - 归约求积", () => {
    const result = reduce([1, 2, 3, 4], (acc, v) => acc * v, 1)
    expect(result).toBe(24)
  })

  test("Array - 归约到对象", () => {
    const result = reduce(["a", "b", "c"], (acc, v, i) => ({ ...acc, [v]: i }), {})
    expect(result).toEqual({ a: 0, b: 1, c: 2 })
  })

  test("Array - 归约到数组", () => {
    const result = reduce([1, 2, 3], (acc, v) => [...acc, v * 2], [] as number[])
    expect(result).toEqual([2, 4, 6])
  })

  test("Array - 使用 index 参数", () => {
    const result = reduce([10, 20, 30], (acc, v, i) => acc + i, 0)
    expect(result).toBe(3) // 0 + 1 + 2
  })

  test("Set - 归约求和", () => {
    const result = reduce(new Set([1, 2, 3]), (acc, v) => acc + v, 0)
    expect(result).toBe(6)
  })

  test("Set - 归约到数组", () => {
    const result = reduce(new Set([1, 2, 3]), (acc, v) => [...acc, v * 2], [] as number[])
    expect(result).toEqual([2, 4, 6])
  })

  test("Map - 归约求和", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ])
    const result = reduce(map, (acc, v) => acc + v, 0)
    expect(result).toBe(6)
  })

  test("Map - 归约到对象", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    const result = reduce(map, (acc, v, k) => ({ ...acc, [k]: v * 2 }), {})
    expect(result).toEqual({ a: 2, b: 4 })
  })

  test("Map - 使用 key 参数", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ])
    const result = reduce(map, (acc, v, k) => acc + k, "")
    expect(result).toBe("ab")
  })

  test("Object - 归约求和", () => {
    const result = reduce({ a: 1, b: 2, c: 3 }, (acc, v) => acc + v, 0)
    expect(result).toBe(6)
  })

  test("Object - 归约到数组", () => {
    const result = reduce({ a: 1, b: 2 }, (acc, v, k) => [...acc, `${k}:${v}`], [] as string[])
    expect(result).toEqual(["a:1", "b:2"])
  })

  test("Object - 使用 key 参数", () => {
    const result = reduce({ a: 1, b: 2 }, (acc, v, k) => acc + k, "")
    expect(result).toBe("ab")
  })

  test("Iterable - 归约", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
    }

    const result = reduce(gen(), (acc, v) => acc + v, 0)
    expect(result).toBe(6)
  })

  test("边界情况 - 空数组", () => {
    const result = reduce([], (acc, v) => acc + v, 10)
    expect(result).toBe(10) // 返回初始值
  })

  test("边界情况 - 单元素数组", () => {
    const result = reduce([5], (acc, v) => acc + v, 10)
    expect(result).toBe(15)
  })

  test("复杂归约 - 找最大值", () => {
    const result = reduce([3, 7, 2, 9, 1], (acc, v) => (v > acc ? v : acc), -Infinity)
    expect(result).toBe(9)
  })

  test("复杂归约 - 分组", () => {
    const result = reduce(
      [1, 2, 3, 4, 5, 6],
      (acc, v) => {
        const key = v % 2 === 0 ? "even" : "odd"
        return { ...acc, [key]: [...(acc[key] || []), v] }
      },
      {} as Record<string, number[]>,
    )
    expect(result).toEqual({
      odd: [1, 3, 5],
      even: [2, 4, 6],
    })
  })
})
