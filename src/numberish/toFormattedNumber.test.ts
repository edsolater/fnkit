import { expect, test } from "vitest"
import { toFormattedNumber } from "./toFormattedNumber"

test("toFormattedNumber", () => {
  const n = 1.5120000000000003e-7
  expect(toFormattedNumber(n)).toEqual("0.00")
  expect(toFormattedNumber(n, { decimals: 9 })).toEqual("0.000000151")
  expect(toFormattedNumber(n, { decimals: 12 })).toEqual("0.000000151200")
})

test("formattedNumber should always respect input decimal", () => {
  expect(toFormattedNumber(1, { decimals: 4 })).toEqual("1.0000")
  expect(toFormattedNumber("1", { decimals: 4 })).toEqual("1.0000")
  expect(toFormattedNumber(1n, { decimals: 4 })).toEqual("1.0000")
  expect(toFormattedNumber("1.00001", { decimals: 4 })).toEqual("1.0000")
  expect(toFormattedNumber("1.00008", { decimals: 4 })).toEqual("1.0001")
  const formattedOne = toFormattedNumber({ decimal: 0, numerator: 1n, denominator: 1n }, { decimals: 4 })
  console.log("formattedOne: ", formattedOne)
  expect(formattedOne).toEqual("1.0000")
})

test("toFormattedNumber2", () => {
  expect(
    toFormattedNumber({ numerator: 99960009998000368816n, denominator: 100000000000000000000n }, { decimals: 12 }),
  ).toEqual("0.999600099980")
})
