import { expect, test } from "vitest"
import { clone } from "./clone"

test("basic clone usage 1", () => {
  const a = { a: 1 }
  const b = clone(a)
  expect(b).toEqual(a)
  expect(b).not.toBe(a)
})

test("basic clone usage 1", () => {
  const a = { a: [1, 2] }
  const b = clone(a)
  expect(b).toEqual(a)
  expect(b).not.toBe(a)
})
