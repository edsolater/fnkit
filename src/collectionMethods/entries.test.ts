import { entryToCollection, toEntries, toEntry } from "./entries"

test("fnkit:entries", () => {
  const entry1 = toEntry("hello", 2)
  const entry2 = toEntry({ key: "sss" }, 3)
  const entry3 = toEntry(3)
  const entry4 = toEntry("hello")

  // toEntry()
  expect(entry1).toEqual(toEntry("hello", 2))
  expect(entry1).toEqual({ key: 2, value: "hello" })

  // toEntries()
  expect([...toEntries({ a: 1, b: 2 })]).toEqual([toEntry(1, "a"), toEntry(2, "b")])

  expect(entryToCollection(toEntries({ a: 1, b: 2 }), "Map")).toEqual(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
  )
})
