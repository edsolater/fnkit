import { describe, test, expect } from "vitest"
import { shakeNil, shakeFalsy, shakeUndefinedItem, unifyItem, unifyByKey } from "./shakeNil"

describe("shakeNil()", () => {
  test("Array - 移除 null 和 undefined", () => {
    const result = shakeNil([1, null, 2, undefined, 3])
    expect(result).toEqual([1, 2, 3])
  })

  test("Array - 保留 0 和空字符串", () => {
    const result = shakeNil([0, '', false, null, undefined])
    expect(result).toEqual([0, '', false])
  })

  test("Array - 空数组", () => {
    const result = shakeNil([])
    expect(result).toEqual([])
  })

  test("Array - 全是 nil", () => {
    const result = shakeNil([null, undefined, null])
    expect(result).toEqual([])
  })

  test("Object - 移除 null 和 undefined 值", () => {
    const result = shakeNil({ a: 1, b: null, c: 2, d: undefined, e: 3 })
    expect(result).toEqual({ a: 1, c: 2, e: 3 })
  })

  test("Object - 保留 falsy 值", () => {
    const result = shakeNil({ a: 0, b: '', c: false, d: null, e: undefined })
    expect(result).toEqual({ a: 0, b: '', c: false })
  })

  test("Set - 移除 nil", () => {
    const result = shakeNil(new Set([1, null, 2, undefined, 3]))
    expect(result).toEqual(new Set([1, 2, 3]))
  })

  test("Map - 移除 nil 值", () => {
    const result = shakeNil(new Map([
      ['a', 1],
      ['b', null],
      ['c', 2],
      ['d', undefined],
    ]))
    expect(result).toEqual(new Map([
      ['a', 1],
      ['c', 2],
    ]))
  })

  test("类型推断 - NonNullable", () => {
    const arr: (number | null | undefined)[] = [1, null, 2, undefined]
    const result: number[] = shakeNil(arr)
    expect(result).toEqual([1, 2])
  })
})

describe("shakeFalsy()", () => {
  test("Array - 移除所有 falsy 值", () => {
    const result = shakeFalsy([1, 0, 2, '', 3, false, null, undefined])
    expect(result).toEqual([1, 2, 3])
  })

  test("Array - 空数组", () => {
    const result = shakeFalsy([])
    expect(result).toEqual([])
  })

  test("Array - 全是 falsy", () => {
    const result = shakeFalsy([0, '', false, null, undefined])
    expect(result).toEqual([])
  })

  test("Object - 移除 falsy 值", () => {
    const result = shakeFalsy({ a: 1, b: 0, c: 2, d: '', e: false, f: null })
    expect(result).toEqual({ a: 1, c: 2 })
  })

  test("Set - 移除 falsy", () => {
    const result = shakeFalsy(new Set([1, 0, 2, false, null]))
    expect(result).toEqual(new Set([1, 2]))
  })

  test("Map - 移除 falsy 值", () => {
    const result = shakeFalsy(new Map<string, number | string>([
      ['a', 1],
      ['b', 0],
      ['c', 2],
      ['d', ''],
    ]))
    expect(result).toEqual(new Map([
      ['a', 1],
      ['c', 2],
    ]))
  })
})

describe("shakeUndefinedItem()", () => {
  test("移除 undefined", () => {
    const result = shakeUndefinedItem([1, undefined, 2, undefined, 3])
    expect(result).toEqual([1, 2, 3])
  })

  test("保留 null", () => {
    const result = shakeUndefinedItem([1, null, 2, undefined, 3])
    expect(result).toEqual([1, null, 2, 3])
  })

  test("保留其他 falsy 值", () => {
    const result = shakeUndefinedItem([0, '', false, undefined])
    expect(result).toEqual([0, '', false])
  })
})

describe("unifyItem()", () => {
  test("数组去重 - 基本类型", () => {
    const result = unifyItem([1, 2, 1, 3, 2, 4])
    expect(result).toEqual([1, 2, 3, 4])
  })

  test("数组去重 - 字符串", () => {
    const result = unifyItem(['a', 'b', 'a', 'c', 'b'])
    expect(result).toEqual(['a', 'b', 'c'])
  })

  test("数组去重 - 保持顺序", () => {
    const result = unifyItem([3, 1, 2, 1, 3])
    expect(result).toEqual([3, 1, 2])
  })

  test("使用 getKey 去重 - 对象数组", () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
      { id: 3, name: 'd' },
    ]
    const result = unifyItem(items, { getKey: (item) => item.id })
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'd' },
    ])
  })

  test("使用 getKey - 保留第一次出现", () => {
    const items = [
      { id: 1, value: 'first' },
      { id: 1, value: 'second' },
    ]
    const result = unifyItem(items, { getKey: (item) => item.id })
    expect(result[0].value).toBe('first')
  })

  test("空数组", () => {
    const result = unifyItem([])
    expect(result).toEqual([])
  })
})

describe("unifyByKey()", () => {
  test("根据键去重", () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
      { id: 3, name: 'd' },
    ]
    const result = unifyByKey(items, (item) => item.id)
    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ id: 1, name: 'a' })
    expect(result[1]).toEqual({ id: 2, name: 'b' })
    expect(result[2]).toEqual({ id: 3, name: 'd' })
  })

  test("保留第一次出现", () => {
    const items = [
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 1, value: 'duplicate' },
    ]
    const result = unifyByKey(items, (item) => item.id)
    expect(result).toEqual([
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
    ])
  })

  test("空数组", () => {
    const result = unifyByKey([], (item: any) => item.id)
    expect(result).toEqual([])
  })

  test("复杂键", () => {
    const items = [
      { name: 'a', age: 20 },
      { name: 'b', age: 30 },
      { name: 'a', age: 25 },
    ]
    const result = unifyByKey(items, (item) => `${item.name}-${item.age}`)
    expect(result.length).toBe(3)
  })
})
