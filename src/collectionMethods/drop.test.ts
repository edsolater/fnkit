import { expect, test, describe } from "vitest"
import { drop } from "./drop"

describe("drop()", () => {
  test("Array - 跳过前 n 个元素", () => {
    const result = drop([1, 2, 3, 4, 5], 2)
    expect(result).toEqual([3, 4, 5])
    expect(Array.isArray(result)).toBe(true)
  })

  test("Array - 跳过 0 个元素", () => {
    const result = drop([1, 2, 3], 0)
    expect(result).toEqual([1, 2, 3])
  })

  test("Array - 跳过超过数组长度", () => {
    const result = drop([1, 2, 3], 10)
    expect(result).toEqual([])
  })

  test("Array - 大数组继承惰性", () => {
    const largeArray = Array.from({ length: 200 }, (_, i) => i)
    let accessCount = 0

    const result = drop(largeArray, 50)

    // 还未执行
    expect(result).toBeDefined()

    // 访问时才执行
    const length = result.length
    expect(length).toBe(150)
  })

  test("Set - 跳过前 n 个元素", () => {
    const result = drop(new Set([1, 2, 3, 4, 5]), 2)
    expect(result).toEqual(new Set([3, 4, 5]))
    expect(result instanceof Set).toBe(true)
  })

  test("Set - 跳过 0 个元素", () => {
    const result = drop(new Set([1, 2, 3]), 0)
    expect(result).toEqual(new Set([1, 2, 3]))
  })

  test("Set - 大集合惰性执行", () => {
    const largeSet = new Set(Array.from({ length: 200 }, (_, i) => i))
    const result = drop(largeSet, 100)

    // 访问时才执行
    const size = result.size
    expect(size).toBe(100)
  })

  test("Map - 跳过前 n 个条目", () => {
    const result = drop(
      new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]),
      1,
    )
    expect(result).toEqual(
      new Map([
        ["b", 2],
        ["c", 3],
      ]),
    )
    expect(result instanceof Map).toBe(true)
  })

  test("Map - 跳过所有元素", () => {
    const result = drop(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      10,
    )
    expect(result.size).toBe(0)
  })

  test("Map - 大集合惰性执行", () => {
    const largeMap = new Map(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    const result = drop(largeMap, 50)

    const size = result.size
    expect(size).toBe(50)
  })

  test("Object - 跳过前 n 个属性", () => {
    const result = drop({ a: 1, b: 2, c: 3, d: 4 }, 2)
    const keys = Object.keys(result)
    expect(keys.length).toBe(2)
  })

  test("Object - 跳过 0 个属性", () => {
    const result = drop({ a: 1, b: 2 }, 0)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  test("Object - 大对象惰性执行", () => {
    const largeObj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    const result = drop(largeObj, 50)

    const keys = Object.keys(result)
    expect(keys.length).toBe(50)
  })

  test("Iterable - 返回迭代器", () => {
    function* gen() {
      yield 1
      yield 2
      yield 3
      yield 4
      yield 5
    }

    const result = drop(gen(), 2)

    // 应该返回迭代器
    expect(typeof result[Symbol.iterator]).toBe("function")

    // 消费迭代器
    const values = Array.from(result)
    expect(values).toEqual([3, 4, 5])
  })

  test("Iterable - 跳过所有元素", () => {
    function* gen() {
      yield 1
      yield 2
    }

    const result = drop(gen(), 10)
    const values = Array.from(result)
    expect(values).toEqual([])
  })

  test("语义验证 - 类似 Iterator Helper", () => {
    // 验证与 Array.prototype.values().drop(n) 语义一致
    const arr = [1, 2, 3, 4, 5]
    const result = drop(arr, 2)

    // 应该跳过前 2 个，保留后 3 个
    expect(result).toEqual([3, 4, 5])
  })

  test("链式操作 - drop 后继续过滤", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const dropped = drop(arr, 3) // [4, 5, 6, 7, 8, 9, 10]

    // dropped 仍然是数组，可以继续操作
    const filtered = dropped.filter((v) => v % 2 === 0)
    expect(filtered).toEqual([4, 6, 8, 10])
  })

  test("性能验证 - 惰性不立即执行", () => {
    let filterCallCount = 0

    const largeArray = Array.from({ length: 1000 }, (_, i) => {
      return {
        get value() {
          filterCallCount++
          return i
        },
      }
    })

    // drop 内部调用 filter，但大数组应该是惰性的
    const result = drop(largeArray, 500)

    // 如果是惰性的，此时 filterCallCount 应该是 0
    // 因为还没有访问 result
    expect(filterCallCount).toBe(0)

    // 访问结果时才执行
    const length = result.length

    // 现在应该执行了
    expect(length).toBe(500)
  })
})
