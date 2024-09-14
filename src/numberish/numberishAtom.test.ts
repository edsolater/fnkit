import { toFraction, toStringNumber } from "./numberishAtom"

import { expect, test } from "vitest"

test("numberish: create from expression", () => {
  expect(toStringNumber(toFraction("3/2"))).toBe("1.5")
})
test("numberish: toString", () => {
  expect(toStringNumber("0.3")).toBe("0.3")
  expect(toStringNumber(8n)).toBe("8")
})
