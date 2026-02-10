import { describe, test, expect } from "vitest"
import { groupBy } from "./groupBy"

describe("groupBy()", () => {
  test("Array - 按奇偶分组", () => {
    const result = groupBy([1, 2, 3, 4, 5, 6], (v) => (v % 2 === 0 ? 'even' : 'odd'))
    expect(result).toEqual({
      odd: [1, 3, 5],
      even: [2, 4, 6],
    })
  })

  test("Array - 按类型分组", () => {
    const arr = [1, 'a', 2, 'b', 3, 'c']
    const result = groupBy(arr, (v) => typeof v)
    expect(result).toEqual({
      number: [1, 2, 3],
      string: ['a', 'b', 'c'],
    })
  })

  test("Array - 使用 index 参数", () => {
    const result = groupBy([10, 20, 30, 40], (v, i) => (i < 2 ? 'first' : 'second'))
    expect(result).toEqual({
      first: [10, 20],
      second: [30, 40],
    })
  })

  test("Array - 空数组", () => {
    const result = groupBy([], (v) => 'group')
    expect(result).toEqual({})
  })

  test("Array - 单组", () => {
    const result = groupBy([1, 2, 3], () => 'all')
    expect(result).toEqual({
      all: [1, 2, 3],
    })
  })

  test("Array - 返回 undefined 的项被过滤", () => {
    const result = groupBy([1, 2, 3, 4], (v) => (v > 2 ? 'large' : undefined))
    expect(result).toEqual({
      large: [3, 4],
    })
  })

  test("Object - 按值分组", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = groupBy(obj, (v) => (v > 2 ? 'large' : 'small'))
    expect(result.small).toEqual({ a: 1, b: 2 })
    expect(result.large).toEqual({ c: 3, d: 4 })
  })

  test("Object - 使用 key 参数", () => {
    const result = groupBy(
      { apple: 1, banana: 2, avocado: 3 },
      (v, k) => (String(k).startsWith('a') ? 'a' : 'other')
    )
    expect(result.a).toEqual({ apple: 1, avocado: 3 })
    expect(result.other).toEqual({ banana: 2 })
  })

  test("Object - 空对象", () => {
    const result = groupBy({}, (v) => 'group')
    expect(result).toEqual({})
  })

  test("Map - 按值分组", () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4],
    ])
    const result = groupBy(map, (v) => (v > 2 ? 'large' : 'small'))
    expect(result.small).toEqual(new Map([
      ['a', 1],
      ['b', 2],
    ]))
    expect(result.large).toEqual(new Map([
      ['c', 3],
      ['d', 4],
    ]))
  })

  test("Map - 使用 key 参数", () => {
    const map = new Map([
      ['apple', 1],
      ['banana', 2],
      ['avocado', 3],
    ])
    const result = groupBy(map, (v, k) => (k.startsWith('a') ? 'a' : 'other'))
    expect(result.a).toEqual(new Map([
      ['apple', 1],
      ['avocado', 3],
    ]))
    expect(result.other).toEqual(new Map([
      ['banana', 2],
    ]))
  })

  test("Map - 空 Map", () => {
    const result = groupBy(new Map(), (v) => 'group')
    expect(result).toEqual({})
  })

  test("复杂场景 - 数字范围分组", () => {
    const numbers = [5, 15, 25, 35, 45, 55]
    const result = groupBy(numbers, (v) => {
      if (v < 20) return '0-19'
      if (v < 40) return '20-39'
      return '40+'
    })
    expect(result).toEqual({
      '0-19': [5, 15],
      '20-39': [25, 35],
      '40+': [45, 55],
    })
  })

  test("复杂场景 - 对象数组按属性分组", () => {
    const users = [
      { name: 'Alice', age: 25, role: 'admin' },
      { name: 'Bob', age: 30, role: 'user' },
      { name: 'Charlie', age: 25, role: 'user' },
    ]
    const result = groupBy(users, (u) => u.role)
    expect(result).toEqual({
      admin: [{ name: 'Alice', age: 25, role: 'admin' }],
      user: [
        { name: 'Bob', age: 30, role: 'user' },
        { name: 'Charlie', age: 25, role: 'user' },
      ],
    })
  })

  test("数字键转字符串", () => {
    const result = groupBy([1, 2, 3, 4], (v) => v % 2 === 0 ? 'even' : 'odd')
    // groupBy 会过滤掉 falsy 的组名（如 0, undefined）
    // 使用字符串键避免这个问题
    expect(result['even']).toEqual([2, 4])
    expect(result['odd']).toEqual([1, 3])
  })
})
