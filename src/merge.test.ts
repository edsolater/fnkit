import { describe, expect, test } from "vitest"
import { merge, mergeWithConfig } from "./merge"

describe("merge", () => {
  test("根层数组会直接拍平合并", () => {
    expect(merge([0, 1, 2], ["hello", "world"]))
      .toEqual([0, 1, 2, "hello", "world"])
  })

  test("根层函数会合成为收集返回值的新函数", () => {
    const mergedFn = merge(
      (n: number) => 3 + n,
      (n: number) => 4 * n,
      () => 5,
    )

    expect(mergedFn(2)).toEqual([5, 8, 5])
  })

  test("嵌套对象中数组会继续合并而基础值取最后一个", () => {
    expect(merge(
      { a: ["world"], b: 2, c: 1 },
      { a: ["hello"], c: 3 },
      { c: [10] },
    )).toEqual({ a: ["world", "hello"], b: 2, c: [10] })
  })
})

describe("mergeWithConfig", () => {
  test("根层数组会交给配置函数处理", () => {
    expect(
      mergeWithConfig([[0, 1, 2], ["hello", "world"]], ({ values }) => values.flat()),
    ).toEqual([0, 1, 2, "hello", "world"])
  })

  test("递归合并时会把当前 key 传给配置函数", () => {
    const seenKeys: Array<keyof any> = []

    const result = mergeWithConfig(
      [{ foo: [0, 1, 2], bar: 1 }, { foo: ["hello", "world"], bar: 2 }],
      ({ key, values }) => {
        seenKeys.push(key)
        return key === "foo" ? values.flat() : values.at(-1)
      },
    )

    expect(result).toEqual({ foo: [0, 1, 2, "hello", "world"], bar: 2 })
    expect(seenKeys).toContain("foo")
    expect(seenKeys).toContain("bar")
  })

  test("只有纯对象字面量才会递归合并", () => {
    class Box {
      constructor(public value: number) {}
    }

    const nullProtoA = Object.assign(Object.create(null), { x: 1 })
    const nullProtoB = Object.assign(Object.create(null), { y: 2 })
    const boxA = new Box(1)
    const boxB = new Box(2)

    expect(mergeWithConfig([{ foo: { x: 1 } }, { foo: { y: 2 } }])).toEqual({ foo: { x: 1, y: 2 } })
    expect(mergeWithConfig([{ foo: nullProtoA }, { foo: nullProtoB }]).foo).toBe(nullProtoB)
    expect(mergeWithConfig([{ foo: boxA }, { foo: boxB }]).foo).toBe(boxB)
  })
})