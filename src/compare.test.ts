/**
 * 本文件验证通用比较与属性判断能力的运行时和类型边界。
 * 它只测试 compare 领域，不替代具体消费领域自己的协议测试。
 */
import { expect, expectTypeOf, test } from "vitest"
import { hasProperty } from "./compare"

test("hasProperty 可以检查 function 持有的字符串和 symbol 属性", () => {
  const metadataKey = Symbol("metadata")
  const callable = Object.assign(() => undefined, {
    label: "callable",
    [metadataKey]: true,
  })

  expect(hasProperty(callable, "label")).toBe(true)
  expect(hasProperty(callable, metadataKey)).toBe(true)
  expect(hasProperty(callable, ["label", metadataKey])).toBe(true)
})

test("hasProperty 可以从 unknown 收窄任意 PropertyKey", () => {
  const metadataKey = Symbol("metadata")
  const value: unknown = Object.assign(() => undefined, {
    [metadataKey]: 8,
  })

  if (!hasProperty(value, metadataKey)) {
    throw new Error("预期 value 持有 metadataKey")
  }

  expectTypeOf(value[metadataKey]).toEqualTypeOf<unknown>()
  expect(value[metadataKey]).toBe(8)
})

test("hasProperty 对基础值返回 false", () => {
  expect(hasProperty(undefined, "value")).toBe(false)
  expect(hasProperty(null, "value")).toBe(false)
  expect(hasProperty(1, "value")).toBe(false)
})
