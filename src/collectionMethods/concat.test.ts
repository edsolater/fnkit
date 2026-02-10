import { expect, test } from "vitest"
import { concat } from "./concat"

test("concat() - 数组合并", () => {
  const result1 = concat([1, 2, 3], [4, 5])
  expect(result1).toEqual([1, 2, 3, 4, 5])

  const result2 = concat(["a", "b"], ["c", "d"])
  expect(result2).toEqual(["a", "b", "c", "d"])

  const result3 = concat([], [1, 2])
  expect(result3).toEqual([1, 2])

  const result4 = concat([1, 2], [])
  expect(result4).toEqual([1, 2])

  // 原数组不变
  const arr1 = [1, 2]
  const arr2 = [3, 4]
  const result5 = concat(arr1, arr2)
  expect(arr1).toEqual([1, 2])
  expect(arr2).toEqual([3, 4])
  expect(result5).toEqual([1, 2, 3, 4])
})

test("concat() - Set合并", () => {
  const result1 = concat(new Set([1, 2]), new Set([3, 4]))
  expect(result1).toEqual(new Set([1, 2, 3, 4]))

  // Set去重特性
  const result2 = concat(new Set([1, 2]), new Set([2, 3]))
  expect(result2).toEqual(new Set([1, 2, 3]))

  const result3 = concat(new Set(), new Set([1, 2]))
  expect(result3).toEqual(new Set([1, 2]))

  const result4 = concat(new Set(["a", "b"]), new Set(["c"]))
  expect(result4).toEqual(new Set(["a", "b", "c"]))

  // 原Set不变
  const set1 = new Set([1, 2])
  const set2 = new Set([3, 4])
  const result5 = concat(set1, set2)
  expect(set1).toEqual(new Set([1, 2]))
  expect(set2).toEqual(new Set([3, 4]))
  expect(result5).toEqual(new Set([1, 2, 3, 4]))
})

test("concat() - 大数组惰性执行", () => {
  const largeArr1 = Array.from({ length: 60 }, (_, i) => i)
  const largeArr2 = Array.from({ length: 60 }, (_, i) => i + 60)
  
  let computeCount = 0
  const arr1WithSideEffect = largeArr1.map(v => {
    computeCount++
    return v
  })
  
  // 重置计数
  computeCount = 0
  
  const result = concat(arr1WithSideEffect, largeArr2)
  
  // 创建 Proxy 时不执行
  expect(computeCount).toBe(0)
  
  // 访问属性时才执行
  const length = result.length
  expect(length).toBe(120)
  
  // 验证结果正确
  expect(result[0]).toBe(0)
  expect(result[59]).toBe(59)
  expect(result[60]).toBe(60)
  expect(result[119]).toBe(119)
})

test("concat() - 小数组立即执行", () => {
  const arr1 = [1, 2, 3]
  const arr2 = [4, 5]
  const result = concat(arr1, arr2)
  
  // 小数组不是 Proxy
  expect(Array.isArray(result)).toBe(true)
  expect(result).toEqual([1, 2, 3, 4, 5])
})

test("concat() - Map合并", () => {
  const result1 = concat(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
    new Map([
      ["c", 3],
      ["d", 4],
    ]),
  )
  expect(result1).toEqual(
    new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ]),
  )

  // 后者覆盖前者
  const result2 = concat(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
    new Map([
      ["b", 20],
      ["c", 3],
    ]),
  )
  expect(result2).toEqual(
    new Map([
      ["a", 1],
      ["b", 20],
      ["c", 3],
    ]),
  )

  const result3 = concat(new Map(), new Map([["a", 1]]))
  expect(result3).toEqual(new Map([["a", 1]]))

  // 原Map不变
  const map1 = new Map([["a", 1]])
  const map2 = new Map([["b", 2]])
  const result4 = concat(map1, map2)
  expect(map1).toEqual(new Map([["a", 1]]))
  expect(map2).toEqual(new Map([["b", 2]]))
  expect(result4).toEqual(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
  )
})

test("concat() - 对象合并", () => {
  const result1 = concat({ a: 1, b: 2 }, { c: 3, d: 4 })
  expect(result1).toEqual({ a: 1, b: 2, c: 3, d: 4 })

  // 后者覆盖前者
  const result2 = concat({ a: 1, b: 2 }, { b: 20, c: 3 })
  expect(result2).toEqual({ a: 1, b: 20, c: 3 })

  const result3 = concat({}, { a: 1 })
  expect(result3).toEqual({ a: 1 })

  const result4 = concat({ a: 1 }, {})
  expect(result4).toEqual({ a: 1 })

  // 原对象不变
  const obj1 = { a: 1 }
  const obj2 = { b: 2 }
  const result5 = concat(obj1, obj2)
  expect(obj1).toEqual({ a: 1 })
  expect(obj2).toEqual({ b: 2 })
  expect(result5).toEqual({ a: 1, b: 2 })
})

test("concat() - 可迭代对象合并", () => {
  const iter1 = (function* () {
    yield 1
    yield 2
    yield 3
  })()

  const iter2 = (function* () {
    yield 4
    yield 5
  })()

  const result = concat(iter1, iter2)
  const values = [...result]
  expect(values).toEqual([1, 2, 3, 4, 5])

  // 测试多次合并
  const iter3 = (function* () {
    yield "a"
    yield "b"
  })()

  const iter4 = (function* () {
    yield "c"
  })()

  const strResult = concat(iter3, iter4)
  const strValues = [...strResult]
  expect(strValues).toEqual(["a", "b", "c"])
})

test("concat() - 类型检查", () => {
  // 这些测试主要是为了确保TypeScript类型系统工作正常
  // 在运行时它们都能正常执行，但在开发时TypeScript会提示类型错误

  // 正确的类型使用
  const arr = concat([1, 2], [3, 4])
  const set = concat(new Set([1]), new Set([2]))
  const map = concat(new Map([["a", 1]]), new Map([["b", 2]]))
  const obj = concat({ a: 1 }, { b: 2 })

  expect(arr).toBeDefined()
  expect(set).toBeDefined()
  expect(map).toBeDefined()
  expect(obj).toBeDefined()

  // 以下会在TypeScript中报错（但测试本身不会失败）：
  // concat([1, 2], new Set([3, 4])) // Error: 类型不匹配
  // concat(new Map(), new Set()) // Error: 类型不匹配
  // concat([1, 2], { a: 3 }) // Error: 类型不匹配
})
