import { describe, test, expect } from "vitest"
import { omit } from "./omit"

describe("omit()", () => {
  test("Object - 排除单个属性", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['a'])
    expect(result).toEqual({ b: 2, c: 3 })
    expect('a' in result).toBe(false)
  })

  test("Object - 排除多个属性", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = omit(obj, ['a', 'c'])
    expect(result).toEqual({ b: 2, d: 4 })
  })

  test("Object - 排除不存在的属性", () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, ['c' as any])
    expect(result).toEqual({ a: 1, b: 2 })
  })

  test("Object - 空排除列表", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, [])
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  test("Object - 单个字符串（MayArray）", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, 'a' as any)
    expect(result).toEqual({ b: 2, c: 3 })
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
    const result = omit(obj, ['a'])
    
    // 未访问时不触发 getter
    expect(accessCount).toBe(0)
    
    // 访问 b 不触发 a 的 getter
    expect(result.b).toBe(2)
    expect(accessCount).toBe(0)
    
    // 访问 a 返回 undefined（已被排除）
    expect((result as any).a).toBeUndefined()
    expect(accessCount).toBe(0)
  })

  test("Object - Object.keys 正确", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = omit(obj, ['b', 'd'])
    const keys = Object.keys(result)
    expect(keys).toEqual(['a', 'c'])
  })

  test("Object - Object.entries 正确", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['b'])
    const entries = Object.entries(result)
    expect(entries).toEqual([['a', 1], ['c', 3]])
  })

  test("Object - for...in 正确", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['b'])
    const keys: string[] = []
    for (const key in result) {
      keys.push(key)
    }
    expect(keys).toEqual(['a', 'c'])
  })

  test("Object - 原对象引用", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['a'])
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
    
    // 注意：omit 返回 Proxy，浅层引用原对象
    // 读取操作从原对象获取
    expect(result.b).toBe(obj.b)
  })

  test("Map - 排除键", () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
    const result = omit(map, ['b'])
    expect(result.size).toBe(2)
    expect(result.has('a')).toBe(true)
    expect(result.has('b')).toBe(false)
    expect(result.has('c')).toBe(true)
  })

  test("Map - 空排除", () => {
    const map = new Map([['a', 1], ['b', 2]])
    const result = omit(map, [])
    expect(result.size).toBe(2)
    expect(result.get('a')).toBe(1)
    expect(result.get('b')).toBe(2)
  })

  test("Map - 原 Map 不变", () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]])
    const result = omit(map, ['b'])
    expect(map.size).toBe(3)
    expect(map.has('b')).toBe(true)
  })

  test("嵌套对象", () => {
    const obj = {
      a: { x: 1 },
      b: { y: 2 },
      c: { z: 3 },
    }
    const result = omit(obj, ['b'])
    expect(result).toEqual({
      a: { x: 1 },
      c: { z: 3 },
    })
    // 引用保持
    expect(result.a).toBe(obj.a)
  })

  test("排除所有属性", () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, ['a', 'b'])
    expect(Object.keys(result).length).toBe(0)
  })
})
