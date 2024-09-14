import { expect, test } from "vitest"
import { createCachedObject } from "./cacheFunction"

test("test fn function:mergeObjectsWithConfigs", () => {
  const obj = createCachedObject({
    a: 3,
    b: 4,
    get c() {
      return this.a++
    },
  })
  expect(Object.keys(obj)).toEqual(["a", "b", "c"])
  expect(obj.c).toEqual(3) // has already access `obj.a`
  expect(obj.c).toEqual(3)
  expect(obj.a).toEqual(4)
})
