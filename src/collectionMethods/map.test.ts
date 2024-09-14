import { expect, test } from "vitest"
import { map, mapEntry } from "./map"

// test("fnkit: flatMapEntries()", () => {
//   const a = flatMapEntry({ a: 1, b: 2 }, (value, key) => [
//     { key: key + "c", value: value + 2 },
//     { key: key + "a", value: value * value * 2 },
//   ])
//   // const a = flatMapEntries({ a: 1, b: 2 }, (value, key) =>
//   //   toEntries({ [key + 'c']: value + 2, [key + 'a']: value * value * 2 })
//   // )
//   expect(a).toEqual({
//     ac: 3,
//     aa: 2,
//     bc: 4,
//     ba: 8,
//   })
// })
// test('fnkit: flatMapEntries()', () => {
//   const a = flatMapEntries({ a: 1, b: 2 }, (value, key) => [
//     { key: [key + 'c'], value: value + 2 },
//     { key: [key + 'a'], value: value * value * 2 }
//   ])
//   // const a = flatMapEntries({ a: 1, b: 2 }, (value, key) =>
//   //   toEntries({ [key + 'c']: value + 2, [key + 'a']: value * value * 2 })
//   // )
//   expect(a).toEqual({
//     ac: 3,
//     aa: 2,
//     bc: 4,
//     ba: 8
//   })
// })

test("map()", () => {
  console.time('map all')
  const source = Array.from({ length: 1002000 }, (_, idx) => idx + 1)

  console.time("map array original")
  const torignal0 = source.map((v) => v + 1)
  console.timeEnd("map array original")

  console.time("map array iterable")
  const t0 = map(source, (v) => v + 1)
  console.timeEnd("map array iterable")

  console.time("map t0 compare")
  expect(t0[3000]).toBe(torignal0[3000])
  expect(t0[3000000]).toBe(torignal0[3000000])
  console.timeEnd("map t0 compare")

  console.time("map 1")
  const t1 = map([1, 2], (v) => v + 1)
  expect(t1).toEqual([2, 3])
  console.timeEnd("map 1")

  console.time("map record")
  const originalObj = Object.fromEntries(Array.from({ length: 1002 }, (_, idx) => [idx + 1, idx + 1])) as Record<
    string,
    number
  >
  const t2 = map(originalObj, (v) => v + 1)
  expect(t2['100']).toEqual(originalObj['100'] + 1)
  console.timeEnd("map record")

  console.time("map set")
  const t4 = map(new Set(["6", "7"]), (v) => v + "1")
  expect(t4).toEqual(new Set(["61", "71"]))
  console.timeEnd("map set")

  console.time("map map")
  const t5 = map(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
    (v) => v + 1,
  )
  expect(t5).toEqual(
    new Map([
      ["a", 2],
      ["b", 3],
    ]),
  )
  console.timeEnd("map map")
  console.timeEnd('map all')
})

test("map() for object", () => {
  const bigObject = Object.fromEntries(Array.from({ length: 10 }, (_, idx) => [idx + "a", idx + 1]))
  const t = mapEntry(bigObject, (v, k) => [k + "v", v + 1])
  expect(t).toEqual(Object.fromEntries(Array.from({ length: 10 }, (_, idx) => [idx + "av", idx + 2])))

  const t2 = map(bigObject, (v, k) => [k + "v", v + 1])
  expect(t2).toEqual(Object.fromEntries(Array.from({ length: 10 }, (_, idx) => [idx + "a", [idx + "av", idx + 2]])))
})

// test("fnkit:mapEntries()", () => {
//   const t12 = mapEntry([1, 2], (v) => toEntry(v + 1, 0))
//   expect(t12).toEqual([2, 3])
//   const t3 = mapEntry({ a: 1, b: 2 }, (v, k) => ({ key: k + "c", value: v + 1 }))
//   expect(t3).toEqual({ ac: 2, bc: 3 })
// })
