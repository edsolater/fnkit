import { createObjectFrom } from "./createFromObject"

test("basic usage", () => {
  const obj = { a: "a", b: "b", c: { d: "d" } }
  const rewrited = createObjectFrom(obj, ({ path, parentPath, key, value }) => {
    if (key === "a") {
      expect(value).toBe("a")
      return { key, value: "a" }
    }
    if (key === "b") {
      expect(value).toBe("b")
      return 1
    }

    if (key === "d") {
      expect(value).toBe("d")
      expect(path).toEqual(["c", "d"])
    }

    if (path.length === 2) {
      return "hello world"
    }
  })
  expect(rewrited).toEqual({ a: { key: "a", value: "a" }, b: 1, c: { d: "hello world" } })
})
