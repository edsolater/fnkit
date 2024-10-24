import { toFraction, toStringNumber } from "./numberishAtom"

import { expect, test } from "vitest"

test("numberish: create from expression", () => {
  expect(toStringNumber(toFraction("3/2"))).toBe("1.5")
})
test("numberish: toString", () => {
  expect(toStringNumber("0.3")).toBe("0.3")

  expect(toStringNumber(8n)).toBe("8")
})
// test("numberish: toString 2", () => {
//   expect(toStringNumber(-7.613920682825182e-8)).toBe("-0.00000007613")
// })

test("numberish: toString 2", () => {
  expect(toFraction("-7.613920682825182e-8")).toEqual({
    decimal: 23,
    numerator: -7613920682825182n,
    denominator: 1n,
  })
  expect(toFraction("3e2")).toEqual({
    decimal: -2,
    numerator: 3n,
    denominator: 1n,
  })
  expect(toStringNumber(toFraction("3e-2"))).toEqual("0.03")
  expect(toStringNumber(toFraction("3e2"))).toEqual("300")
  expect(toStringNumber(toFraction("3.44e2"))).toEqual("344")
  expect(toStringNumber(-7.613920682825182e-8, { decimals: 10 })).toBe("-0.0000000761")
})
