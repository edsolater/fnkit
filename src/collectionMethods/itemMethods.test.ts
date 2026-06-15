import { describe, expect, test } from "vitest"
import { Entry } from "./iteratorableItemAndEntry"
import { toList, toMap, toRecord, toSet } from "./itemMethods"

describe("集合转换 valueMapper", () => {
  test("toList 可以映射 Array、Map、Object 和 entry Iterable 的值", () => {
    function* entries() {
      yield Entry.of(2, "a")
      yield [3, "b"] as const
      yield { value: 4, key: "c" }
    }

    expect(toList([10, 20], (value, key) => `${key}:${value}`)).toEqual(["0:10", "1:20"])
    expect(
      toList(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
        (value, key) => `${key}:${value}`,
      ),
    ).toEqual(["a:1", "b:2"])
    expect(toList({ a: 1, b: 2 }, (value, key) => `${key}:${value}`)).toEqual(["a:1", "b:2"])
    expect(toList(entries(), (value, key) => `${key}:${value}`)).toEqual(["a:2", "b:3", "c:4"])
  })

  test("toMap 对各种来源类型都应用 key mapper 和 value mapper", () => {
    expect(toMap([1, 2], (value, key) => `${key}-${value}`, (value) => value * 10)).toEqual(
      new Map([
        ["0-1", 10],
        ["1-2", 20],
      ]),
    )

    expect(toMap(new Set([1, 2]), (value, key) => `${key}-${value}`, (value) => value * 10)).toEqual(
      new Map([
        ["0-1", 10],
        ["1-2", 20],
      ]),
    )

    expect(toMap(new Map([["a", 1]]), (value, key) => `${key}-${value}`, (value) => value * 10)).toEqual(
      new Map([["a-1", 10]]),
    )

    expect(toMap({ a: 1 }, (value, key) => `${key}-${value}`, (value) => value * 10)).toEqual(
      new Map([["a-1", 10]]),
    )
  })

  test("toMap 可以只映射 value，同时保留 Map 原有 key", () => {
    const source = new Map([
      ["a", 1],
      ["b", 2],
    ])

    expect(toMap(source, undefined, (value, key) => `${key}:${value}`)).toEqual(
      new Map([
        ["a", "a:1"],
        ["b", "b:2"],
      ]),
    )
  })

  test("toSet 和 toRecord 会应用 value mapper", () => {
    expect(toSet({ a: 1, b: 2 }, (value, key) => `${key}:${value}`)).toEqual(new Set(["a:1", "b:2"]))

    expect(
      toRecord(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
        (_value, key) => key,
        (value) => value * 10,
      ),
    ).toEqual({ a: 10, b: 20 })
  })

  test("value mapper 返回 undefined 时也应使用该结果", () => {
    expect(toList([1], () => undefined)).toEqual([undefined])
    expect(toMap([1], (value) => value, () => undefined)).toEqual(new Map([[1, undefined]]))
    expect(toSet([1], () => undefined)).toEqual(new Set([undefined]))
    expect(toRecord([1], (_value, key) => key, () => undefined)).toEqual({ 0: undefined })
  })
})
