import { expect, test } from "vitest"
import { asyncMutatableChangeObjectWithRules, getByPath, travelObject } from "./travelObject"

test("basic usage", () => {
  const obj = { a: "a", b: "b", c: { d: "d" } }
  travelObject(obj, ({ path, parentPath, key, value }) => {
    if (key === "a") {
      expect(value).toBe("a")
    }
    if (key === "b") {
      expect(value).toBe("b")
    }

    if (key === "d") {
      expect(value).toBe("d")
      expect(path).toEqual(["c", "d"])
    }

    if (path.length === 2) {
      const targetObj = getByPath(obj, parentPath)
      targetObj[key] = "hello world"
    }
  })
  expect(obj.c.d).toBe("hello world")
})

test("asyncChangeObjectWithRules example", () => {
  const original = { propertyA: { hello: "world" }, propertyB: { a: { type: "ll" } } }
  asyncMutatableChangeObjectWithRules(original, [
    [(v) => v === "world", () => "yes"],
    [
      (v) => v?.type === "ll",
      () => ({
        with: "hi",
      }),
    ],
  ]).then((obj) => {
    return expect(obj).toEqual({ propertyA: { hello: "yes" }, propertyB: { a: { with: "hi" } } })
  })
})
