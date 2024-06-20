import { toStringNumber } from "./numberishAtom"
import { add, applyDecimal, minus, mul, multiply, pow } from "./operations"

test("numberish: toStringNumber", () => {
  expect(toStringNumber(3.22)).toBe("3.22")
  expect(toStringNumber({ numerator: 12312n, decimal: 4 })).toBe("1.2312")
})

test("numberish: operators", () => {
  expect(toStringNumber(add("9007199254740991.4", "112.4988"))).toBe("9007199254741103.8988")

  expect(toStringNumber(minus("1.22", "112.3"))).toBe("-111.08")
  expect(toStringNumber(minus("1.22", "-112.3"))).toBe("113.52")
  expect(toStringNumber(minus("9007199254740991.4", "112.4988"))).toBe("9007199254740878.9012")

  expect(toStringNumber(multiply("1.22", "112.3"))).toBe("137.006")
  expect(toStringNumber(multiply("9007199254740991.4", "112.4988"))).toBe("1013299107519255843.31032")
  expect(toStringNumber(multiply(add(90, 10), "112.4988"))).toBe("11249.88")
})

test("numberish: operator add", () => {
  expect(add(10, 123)).toBe(133)
  expect(toStringNumber(add("9007199254740991.4", "112.4988"))).toBe("9007199254741103.8988")
})

test("operator:mul", () => {
  expect(toStringNumber(multiply(add(90, 10), "112.4988"))).toBe("11249.88")
  expect(toStringNumber(multiply(0.1, 3))).toBe("0.3")
})

test("pow: (2 ^ 3 = 8)", () => {
  expect(toStringNumber(pow("2", "3"))).toBe("8")
  // expect(toString(pow(2n, '3'))).toBe('8')
  // expect(toString(pow('2', '3.1')).startsWith('8.57418')).toBe(true)
})
test("apply decimal", () => {
  expect(applyDecimal(4.3424, 3)).toBe("0.0043424")
  expect(applyDecimal(4.3424, -3)).toBe("4342.4")
  expect(applyDecimal(4.3424, -4)).toBe("43424")
  expect(applyDecimal(43424, 3)).toBe("43.424")
  expect(applyDecimal(43424, 8)).toBe("0.00043424")
  expect(applyDecimal(43424, -2)).toBe("4342400")
})
