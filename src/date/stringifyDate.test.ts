import { expect, test } from "vitest"
import { createCurrentDateTimeStr } from "./stringifyDate"

test("stringify date", () => {
  expect(createCurrentDateTimeStr()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
})
