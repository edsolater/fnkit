import { describe, expect, test } from "vitest"
import {
  Pattern,
  pred,
  matchEq,
  oneOf,
  re,
  startsWith,
  includes,
  otherwise,
  ifPattern,
} from "./ifPattern"

describe("Pattern class", () => {
  test("Pattern class should have public properties", () => {
    const pattern = new Pattern((v: number) => v > 0, "positive")
    expect(pattern.matchRule).toBeDefined()
    expect(pattern.label).toBe("positive")
  })

  test("test() method should work", () => {
    const pattern = new Pattern((v: number) => v > 0)
    expect(pattern.test(5)).toBe(true)
    expect(pattern.test(-5)).toBe(false)
  })

  test("and() should combine patterns with AND logic", () => {
    const isPositive = pred((v: number) => v > 0, "positive")
    const isEven = pred((v: number) => v % 2 === 0, "even")
    const combined = isPositive.and(isEven)

    expect(combined.test(4)).toBe(true)
    expect(combined.test(3)).toBe(false)
    expect(combined.test(-4)).toBe(false)
  })

  test("or() should combine patterns with OR logic", () => {
    const isZero = matchEq(0)
    const isOne = matchEq(1)
    const combined = isZero.or(isOne)

    expect(combined.test(0)).toBe(true)
    expect(combined.test(1)).toBe(true)
    expect(combined.test(2)).toBe(false)
  })

  test("not() should invert pattern", () => {
    const isZero = matchEq(0)
    const notZero = isZero.not()

    expect(notZero.test(0)).toBe(false)
    expect(notZero.test(1)).toBe(true)
  })

  test("complex pattern composition", () => {
    const isPositive = pred((v: number) => v > 0)
    const isLessThan10 = pred((v: number) => v < 10)
    const isEven = pred((v: number) => v % 2 === 0)

    // (positive AND lessThan10) AND NOT even
    const pattern = isPositive.and(isLessThan10).and(isEven.not())

    expect(pattern.test(3)).toBe(true)
    expect(pattern.test(4)).toBe(false)
    expect(pattern.test(11)).toBe(false)
  })
})

describe("Pattern constructors", () => {
  test("pred() creates custom pattern", () => {
    const isEven = pred((n: number) => n % 2 === 0, "isEven")
    expect(isEven.test(4)).toBe(true)
    expect(isEven.test(5)).toBe(false)
    expect(isEven.label).toBe("isEven")
  })

  test("eq() matches using Object.is", () => {
    const isFive = matchEq(5)
    expect(isFive.test(5)).toBe(true)
    expect(isFive.test(5.0)).toBe(true)

    const isNaN = matchEq(NaN)
    expect(isNaN.test(NaN)).toBe(true)

    const isHello = matchEq("hello")
    expect(isHello.test("hello")).toBe(true)
    expect(isHello.test("world")).toBe(false)
  })

  test("oneOf() matches multiple values", () => {
    const isVowel = oneOf("a", "e", "i", "o", "u")
    expect(isVowel.test("a")).toBe(true)
    expect(isVowel.test("e")).toBe(true)
    expect(isVowel.test("b")).toBe(false)

    const isStatusOk = oneOf(200, 201, 204)
    expect(isStatusOk.test(200)).toBe(true)
    expect(isStatusOk.test(404)).toBe(false)
  })

  test("re() matches regex", () => {
    const isUrl = re(/^https?:\/\//)
    expect(isUrl.test("https://example.com")).toBe(true)
    expect(isUrl.test("http://example.com")).toBe(true)
    expect(isUrl.test("ftp://example.com")).toBe(false)

    const isNumber = re(/^\d+$/)
    expect(isNumber.test("123")).toBe(true)
    expect(isNumber.test("12a")).toBe(false)
  })

  test("startsWith() matches string prefix", () => {
    const isHttps = startsWith("https")
    expect(isHttps.test("https://example.com")).toBe(true)
    expect(isHttps.test("http://example.com")).toBe(false)
  })

  test("includes() matches substring", () => {
    const hasGithub = includes("github")
    expect(hasGithub.test("https://github.com")).toBe(true)
    expect(hasGithub.test("https://gitlab.com")).toBe(false)
  })

  test("otherwise() always matches", () => {
    const always = otherwise()
    expect(always.test(1)).toBe(true)
    expect(always.test("anything")).toBe(true)
    expect(always.test(null)).toBe(true)
    expect(always.test(undefined)).toBe(true)
  })
})

describe("ifPattern function", () => {
  test("basic pattern matching with Pattern objects", () => {
    const result = ifPattern("https://github.com", [
      [re(/^https?:\/\//), () => "url"],
      [startsWith("git:"), () => "git"],
      [otherwise(), () => "other"],
    ])
    expect(result).toBe("url")
  })

  test("pattern matching with direct values", () => {
    const result = ifPattern(200, [
      [200, () => "success"],
      [404, () => "not found"],
      [otherwise(), () => "unknown"],
    ])
    expect(result).toBe("success")
  })

  test("pattern matching with mixed patterns and values", () => {
    const result = ifPattern(500, [
      [200, () => "ok"],
      [oneOf(500, 502, 503), () => "server error"],
      [otherwise(), () => "other"],
    ])
    expect(result).toBe("server error")
  })

  test("pattern matching with composition", () => {
    const result = ifPattern("https://github.com/user/repo", [
      [startsWith("https").and(includes("github")), () => "github https"],
      [startsWith("http"), () => "http"],
      [otherwise(), () => "other"],
    ])
    expect(result).toBe("github https")
  })

  test("handler receives the matched value", () => {
    const result = ifPattern(42, [
      [pred((n: number) => n > 10), (v) => `large: ${v}`],
      [otherwise(), (v) => `small: ${v}`],
    ])
    expect(result).toBe("large: 42")
  })

  test("evaluates rules in order", () => {
    const result = ifPattern(5, [
      [pred((n: number) => n > 0), () => "positive"],
      [pred((n: number) => n < 10), () => "less than 10"],
      [otherwise(), () => "other"],
    ])
    // Should match first rule
    expect(result).toBe("positive")
  })

  test("throws error when no pattern matches", () => {
    expect(() => {
      ifPattern(404, [
        [200, () => "ok"],
        [201, () => "created"],
      ])
    }).toThrow("[ifPattern] No pattern matched")
  })

  test("complex real-world example: URL classification", () => {
    const classifyUrl = (url: string) =>
      ifPattern(url, [
        [startsWith("https://github.com"), () => "github"],
        [startsWith("https://gitlab.com"), () => "gitlab"],
        [re(/^git@/), () => "git-ssh"],
        [startsWith("https").and(includes("localhost").not()), () => "remote-https"],
        [startsWith("http://localhost"), () => "local"],
        [otherwise(), () => "unknown"],
      ])

    expect(classifyUrl("https://github.com/user/repo")).toBe("github")
    expect(classifyUrl("https://gitlab.com/user/repo")).toBe("gitlab")
    expect(classifyUrl("git@github.com:user/repo")).toBe("git-ssh")
    expect(classifyUrl("https://example.com")).toBe("remote-https")
    expect(classifyUrl("http://localhost:3000")).toBe("local")
    expect(classifyUrl("ftp://example.com")).toBe("unknown")
  })

  test("complex real-world example: HTTP status handling", () => {
    const handleStatus = (code: number) =>
      ifPattern(code, [
        [oneOf(200, 201, 204), () => "success"],
        [oneOf(301, 302, 307, 308), () => "redirect"],
        [oneOf(400, 401, 403, 404), () => "client-error"],
        [pred((n: number) => n >= 500), () => "server-error"],
        [otherwise(), () => "unknown"],
      ])

    expect(handleStatus(200)).toBe("success")
    expect(handleStatus(302)).toBe("redirect")
    expect(handleStatus(404)).toBe("client-error")
    expect(handleStatus(500)).toBe("server-error")
    expect(handleStatus(100)).toBe("unknown")
  })

  test("works with plain predicate functions", () => {
    const result = ifPattern(42, [
      [(n: number) => n < 10, () => "small"],
      [(n: number) => n % 2 === 0, () => "even"],
      [otherwise(), () => "other"],
    ])
    expect(result).toBe("even")
  })
})
