import { expect, test } from "vitest"
import { toEntries, toEntry } from "./entries"

test("fnkit:entries", () => {
  const entry1 = toEntry("hello", 2)
  const entry2 = toEntry({ key: "sss" }, 3)
  const entry3 = toEntry(3)
  const entry4 = toEntry("hello")

  // toEntry()
  expect(entry1).toEqual({ key: 2, value: "hello" })
  expect(entry2).toEqual({ key: 3, value: { key: "sss" } })
  console.log("entry3: ", entry3)
  expect(entry3).toEqual({ key: undefined, value: 3 })
  expect(entry4).toEqual({ key: undefined, value: "hello" })

  // toEntries()
})

test("fnkit:toEntries", () => {
  const n = toEntries({ a: 1, b: 2 })
  console.log("n: ", n)
  expect(n).toEqual([
    ["a", 1],
    ["b", 2],
  ])
})
