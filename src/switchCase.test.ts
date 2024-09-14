import { expect, test } from "vitest"
import { switchCase } from "./switchCase"

test(`${switchCase}() basic usage`, () => {
  const a1 = switchCase("a", { a: 1 })
  expect(a1).toBe(1)

  const text = "hello" as "hello" | "world"
  const t2 = switchCase(text, { hello: "world", world: "hello" })
})
