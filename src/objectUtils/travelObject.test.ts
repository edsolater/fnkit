import { getByPath, travelObject } from "./travelObject"

test("basic usage", () => {
  const obj = { a: "a", b: "b", c: { d: "d" } }
  travelObject(obj, ({ keyPaths, parentPath, key, value }) => {
    if (key === "a") {
      expect(value).toBe("a")
    }
    if (key === "b") {
      expect(value).toBe("b")
    }

    if (key === "d") {
      expect(value).toBe("d")
      expect(keyPaths).toEqual(["c", "d"])
    }

    if (keyPaths.length === 2) {
      const targetObj = getByPath(obj, parentPath)
      targetObj[key] = "hello world"
    }
  })
  expect(obj.c.d).toBe("hello world")
})
