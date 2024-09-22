import { expect, test } from "vitest"
import { switchCase } from "./switchCase"

test(`${switchCase}() basic usage`, () => {
  const a1 = switchCase("a", { a: 1 })
  expect(a1).toBe(1)

  const text = "hello" as "hello" | "foo"
  const t2 = switchCase(text, { hello: "world", foo: () => "faz" })
  expect(t2).toBe("world")

  const text2 = "foo" as "hello" | "foo"
  const t3 = switchCase(text2, { hello: "world", foo: () => "faz" })
  expect(t3).toBe("faz")
})
