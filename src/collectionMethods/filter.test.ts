import { expect, test } from "vitest"
import { filter } from "./filter"

test("filter()", () => {
  const source = Array.from({ length: 100000 }, (_, idx) => idx + 1)

  console.time("filter array original")
  const torignal0 = source.filter((v) => v % 2)
  console.timeEnd("filter array original")

  console.time("filter array iterable")
  const t0 = filter(source, (v) => v % 2)
  console.timeEnd("filter array iterable")

  const t1 = filter([1, 2], (v) => v % 2)
  expect(t1).toEqual([1])

  const t2 = filter({ a: 1, b: 2 }, (v) => v % 2)
  expect(t2).toEqual({ a: 1 })

  const t4 = filter(new Set([6, 7]), (v) => v % 2)
  expect(t4).toEqual(new Set([7]))

  const t5 = filter(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
    (v, k) => k === "a",
  )
  expect(t5).toEqual(new Map([["a", 1]]))

  const t6 = filter({ a: 1, b: 2 }, (v, k) => k === "a")
  expect(t6).toEqual({ a: 1 })
})
