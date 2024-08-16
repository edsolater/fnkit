import { isShallowEqual } from "./dataType"

test("isShallowEqual", () => {
  expect(isShallowEqual({ a: ["b", "c"] }, { a: ["b", "c"] })).toBe(true)
  expect(isShallowEqual({ a: ["b", "c", { hello: "world" }] }, { a: ["b", "c", { hello: "world" }] })).toBe(true)
  expect(
    isShallowEqual(new Map([["test", new Set(["hello", "world"])]]), new Map([["test", new Set(["hello", "world"])]])),
  ).toBe(true)
})
