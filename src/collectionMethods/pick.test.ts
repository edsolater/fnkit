import { describe, test, expect } from "vitest"
import { pick } from "./pick"

describe("pick()", () => {
  test("Object - 选择单个属性", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, ['a'])
    expect(result).toEqual({ a: 1 })
    expect(result.a).toBe(1)
    expect((result as any).b).toBeUndefined()
  })

  test("Object - 选择多个属性", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = pick(obj, ['a', 'c'])
    expect(result).toEqual({ a: 1, c: 3 })
    expect('b' in result).toBe(false)
    expect('d' in result).toBe(false)
  })

  test("Object - 选择不存在的属性", () => {
    const obj = { a: 1, b: 2 }
    const result = pick(obj, ['a', 'c' as any])
    expect(result).toEqual({ a: 1 })
    expect('c' in result).toBe(false)
  })

  test("Object - 空选择列表", () => {
    const obj = { a: 1, b: 2 }
    const result = pick(obj, [])
    expect(Object.keys(result).length).toBe(0)
  })

  test("Object - 单个字符串（MayArray）", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, 'a' as any)
    expect(result.a).toBe(1)
    expect(Object.keys(result).length).toBe(1)
  })

  test("Object - Proxy 惰性", () => {
    let accessCount = 0
    const obj = {
      get a() {
        accessCount++
        return 1
      },
      b: 2,
      c: 3,
    }
    const result = pick(obj, ['a', 'b'])
    
    // 未访问时不触发 getter
    expect(accessCount).toBe(0)
    
    // 访问 a 触发 getter
    expect(result.a).toBe(1)
    expect(accessCount).toBe(1)
    
    // 访问 b 不触发 a 的 getter
    expect(result.b).toBe(2)
    expect(accessCount).toBe(1)
  })

  test("Object - Object.keys 正确", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = pick(obj, ['a', 'c'])
    const keys = Object.keys(result)
    expect(keys).toEqual(['a', 'c'])
  })

  test("Object - Object.entries 正确", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, ['a', 'b'])
    const entries = Object.entries(result)
    expect(entries).toEqual([['a', 1], ['b', 2]])
  })

  test("Object - for...in 正确", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, ['a', 'c'])
    const keys: string[] = []
    for (const key in result) {
      keys.push(key)
    }
    expect(keys).toEqual(['a', 'c'])
  })

  test("Object - 原对象不变（引用）", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, ['a'])
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
    
    // 注意：pick 返回 Proxy，修改会影响原对象（浅层引用）
    // 这是 Proxy 的行为特性
  })

  test("Map - 选择键", () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
    const result = pick(map, ['a', 'c'])
    expect(result.has('a')).toBe(true)
    expect(result.has('b')).toBe(false)
    expect(result.has('c')).toBe(true)
  })

  test("Map - 空选择", () => {
    const map = new Map([['a', 1], ['b', 2]])
    const result = pick<string, number>(map, [])
    // 空选择列表 = 没有选中任何键
    expect(result.size).toBe(0)
  })

  test("嵌套对象", () => {
    const obj = {
      a: { x: 1 },
      b: { y: 2 },
      c: { z: 3 },
    }
    const result = pick(obj, ['a', 'c'])
    expect(result).toEqual({
      a: { x: 1 },
      c: { z: 3 },
    })
    // 引用保持
    expect(result.a).toBe(obj.a)
  })
})
