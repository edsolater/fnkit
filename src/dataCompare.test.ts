import { isItemContainedIn, isShallowEqual, isSubCollectorOf } from "./dataCompare"

test("isShallowEqual", () => {
  expect(isShallowEqual({ a: ["b", "c"] }, { a: ["b", "c"] })).toBe(true)
  expect(isShallowEqual({ a: ["b", "c", { hello: "world" }] }, { a: ["b", "c", { hello: "world" }] })).toBe(true)
  expect(
    isShallowEqual(new Map([["test", new Set(["hello", "world"])]]), new Map([["test", new Set(["hello", "world"])]])),
  ).toBe(true)
})

test("isItemContained", () => {
  expect(isItemContainedIn([1, 2, 3], 2)).toBe(true)
  expect(isItemContainedIn({ a: 1, b: 2 }, 2)).toBe(true)
  expect(isItemContainedIn(new Set([1, 2, 3]), 2)).toBe(true)
  expect(
    isItemContainedIn(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      2,
    ),
  ).toBe(true)
})

test("isSubCollectorOf", () => {
  expect(isSubCollectorOf([1, 2, 3], [2])).toBe(true)
  expect(isSubCollectorOf({ a: 1, b: 2, c: 3 }, { b: 2, c: 3 })).toBe(true)
  expect(isSubCollectorOf({ a: 1, b: 2 }, { a: 2 })).toBe(false)
  expect(isSubCollectorOf(new Set([1, 2, 3]), new Set([2]))).toBe(true)
  expect(
    isSubCollectorOf(
      new Map([
        ["a", [4]],
        ["b", [1, 2]],
      ]),
      new Map([["b", [1, 2]]]),
    ),
  ).toBe(true)
})
