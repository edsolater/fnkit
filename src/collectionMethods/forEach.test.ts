import { describe, test, expect } from "vitest"
import { forEach, forEachKey } from "./forEach"

describe("forEach()", () => {
  test("Array - 遍历数组", () => {
    const result: number[] = []
    forEach([1, 2, 3], (v, i) => {
      result.push(v * i)
    })
    expect(result).toEqual([0, 2, 6])
  })

  test("Array - 空数组", () => {
    let count = 0
    forEach([], () => count++)
    expect(count).toBe(0)
  })

  test("Array - 接收原数组参数", () => {
    const arr = [1, 2, 3]
    let receivedArr: any = null
    forEach(arr, (v, i, original) => {
      receivedArr = original
    })
    expect(receivedArr).toBe(arr)
  })

  test("Set - 遍历集合", () => {
    const result: string[] = []
    forEach(new Set(['a', 'b', 'c']), (v, k) => {
      result.push(`${v}:${k}`)
    })
    expect(result).toEqual(['a:a', 'b:b', 'c:c'])
  })

  test("Set - 空集合", () => {
    let count = 0
    forEach(new Set(), () => count++)
    expect(count).toBe(0)
  })

  test("Map - 遍历映射", () => {
    const result: string[] = []
    forEach(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
      (v, k) => {
        result.push(`${k}:${v}`)
      }
    )
    expect(result).toEqual(['a:1', 'b:2'])
  })

  test("Map - 空映射", () => {
    let count = 0
    forEach(new Map(), () => count++)
    expect(count).toBe(0)
  })

  test("Object - 遍历对象", () => {
    const result: string[] = []
    forEach({ a: 1, b: 2, c: 3 }, (v, k) => {
      result.push(`${String(k)}:${v}`)
    })
    expect(result.length).toBe(3)
    expect(result).toContain('a:1')
    expect(result).toContain('b:2')
    expect(result).toContain('c:3')
  })

  test("Object - 空对象", () => {
    let count = 0
    forEach({}, () => count++)
    expect(count).toBe(0)
  })

  test("null/undefined - 不报错", () => {
    expect(() => forEach(null as any, () => {})).not.toThrow()
    expect(() => forEach(undefined as any, () => {})).not.toThrow()
  })

  test("副作用验证 - 累加", () => {
    let sum = 0
    forEach([1, 2, 3, 4, 5], (v) => {
      sum += v
    })
    expect(sum).toBe(15)
  })

  test("副作用验证 - 修改外部数组", () => {
    const results: number[] = []
    forEach([1, 2, 3], (v) => {
      results.push(v * 2)
    })
    expect(results).toEqual([2, 4, 6])
  })
})

describe("forEachKey()", () => {
  test("对象 - 遍历键", () => {
    const keys: string[] = []
    const values: number[] = []
    forEachKey({ a: 1, b: 2, c: 3 }, (k, v) => {
      keys.push(String(k))
      values.push(v)
    })
    expect(keys.length).toBe(3)
    expect(values.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  test("对象 - 空对象", () => {
    let count = 0
    forEachKey({}, () => count++)
    expect(count).toBe(0)
  })

  test("对象 - 键值对应正确", () => {
    const result: Record<string, number> = {}
    forEachKey({ a: 1, b: 2 }, (k, v) => {
      result[String(k)] = v * 2
    })
    expect(result).toEqual({ a: 2, b: 4 })
  })
})
