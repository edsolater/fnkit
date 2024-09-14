import { expect, test } from "vitest"
import { buildFromAnatomyNumberInfo, parseAnatomyNumberInfo } from "./parseAnatomyNumberInfo"

test("toFormattedNumber2", () => {
  expect(parseAnatomyNumberInfo(443)).toEqual({ dec: "", e: 0, int: "443", sign: "" })
  expect(buildFromAnatomyNumberInfo(parseAnatomyNumberInfo(443))).toEqual("443")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: -5 })).toEqual("3245100")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: -3 })).toEqual("32451")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: -2 })).toEqual("3245.1")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: 1 })).toEqual("3.2451")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: 2 })).toEqual("0.32451")
  expect(buildFromAnatomyNumberInfo({ int: "32", dec: "451", e: 3 })).toEqual("0.032451")
})
