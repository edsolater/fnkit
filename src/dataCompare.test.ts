import { isItemContained, isShallowEqual, isSubCollector } from "./dataCompare"

test("isShallowEqual", () => {
  expect(isShallowEqual({ a: ["b", "c"] }, { a: ["b", "c"] })).toBe(true)
  expect(isShallowEqual({ a: ["b", "c", { hello: "world" }] }, { a: ["b", "c", { hello: "world" }] })).toBe(true)
  expect(
    isShallowEqual(new Map([["test", new Set(["hello", "world"])]]), new Map([["test", new Set(["hello", "world"])]])),
  ).toBe(true)
})

test("isItemContained", () => {
  expect(isItemContained(2, [1, 2, 3])).toBe(true)
  expect(isItemContained(2, { a: 1, b: 2 })).toBe(true)
  expect(isItemContained(2, new Set([1, 2, 3]))).toBe(true)
  expect(
    isItemContained(
      2,
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    ),
  ).toBe(true)
})

test("isSubCollector", () => {
  expect(isSubCollector([2], [1, 2, 3])).toBe(true)
  expect(isSubCollector({ b: 2, c: 3 }, { a: 1, b: 2, c: 3 })).toBe(true)
  expect(isSubCollector({ a: 2 }, { a: 1, b: 2 })).toBe(false)
  expect(isSubCollector(new Set([2]), new Set([1, 2, 3]))).toBe(true)
  expect(
    isSubCollector(
      new Map([["b", [1, 2]]]),
      new Map([
        ["a", [4]],
        ["b", [1, 2]],
      ]),
    ),
  ).toBe(true)
})
