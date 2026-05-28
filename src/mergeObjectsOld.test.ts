import { expect, test } from "vitest"
import { isSymbol } from "./dataType"
import { getKeys } from "./mergeObject"
import { mergeObjectsWithConfigs } from "./mergeObjectsOld"

const symbol = Symbol("s")
test("旧版对象合并接口继续兼容 valueA 和 valueB 回调", () => {
  expect(getKeys([{ a: 3, b: 4 }, { a: 5, b: 6, c: 7 }])).toEqual(["a", "b", "c"])

  expect(
    mergeObjectsWithConfigs([
      { a: 3, b: 4 },
      { a: 5, b: 6, c: 7 },
    ]),
  ).toEqual({ a: 5, b: 6, c: 7 })

  expect(
    mergeObjectsWithConfigs(
      [
        { [symbol]: "3", a: 3, b: 4 },
        { [symbol]: "4", a: 5, b: 6, c: 7 },
      ],
      ({ key, valueA, valueB }) => `${isSymbol(key) ? key.description : String(key)}${valueA}${valueB}`,
    ),
  ).toEqual({ a: "a35", b: "b46", c: 7, [symbol]: "s34" })

  expect(
    Reflect.ownKeys(
      mergeObjectsWithConfigs([
        { [symbol]: "3", a: 3, b: 4 },
        { [symbol]: "4", a: 5, b: 6, c: 7 },
      ]),
    )
      .map((i) => String(i))
      .sort(),
  ).toEqual([symbol, "a", "b", "c"].map((i) => String(i)).sort())
})
