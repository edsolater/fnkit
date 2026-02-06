import { describe, expect, test } from "vitest"
import {
  isDurationInfo,
  isTimeRange,
  parseDuration,
  parseDurationAbsolute,
  parseTimeRange,
  parseTimeRangeToMilliseconds
} from "./parseDuration"

describe("parseDuration 系列", () => {
  describe("parseDuration", () => {
    test("基础拆分：秒级输入应被解析为天/时/分/秒/毫秒", () => {
      const result = parseDuration(24 * 60 * 60 + 1.5)
      expect(result.days).toBe(1)
      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(1)
      expect(result.milliseconds).toBe(500)
    })

    test("返回对象结构应包含标准字段", () => {
      const result = parseDuration(1)
      expect(isDurationInfo(result)).toBe(true)
      expect(result).toHaveProperty("full")
      expect(result).toHaveProperty("days")
      expect(result).toHaveProperty("hours")
      expect(result).toHaveProperty("minutes")
      expect(result).toHaveProperty("seconds")
      expect(result).toHaveProperty("milliseconds")
    })
  })

  describe("parseDurationAbsolute", () => {
    test("绝对拆分：字段是按比例计算，不进行进位拆分", () => {
      const result = parseDurationAbsolute(3600)
      expect(result.hours).toBe(1)
      expect(result.minutes).toBe(60)
      expect(result.seconds).toBe(3600)
      expect(result.milliseconds).toBe(3600 * 1000)
    })
  })

  describe("isTimeRange", () => {
    test("数字直接视为合法（单位：秒）", () => {
      expect(isTimeRange(1)).toBe(true)
      expect(isTimeRange(1.5)).toBe(true)
      expect(isTimeRange(-2)).toBe(true)
    })

    test("支持缩写单位（允许可选空格）", () => {
      expect(isTimeRange("10ms")).toBe(true)
      expect(isTimeRange("10 ms")).toBe(true)
      expect(isTimeRange("5s")).toBe(true)
      expect(isTimeRange("5 s")).toBe(true)
      expect(isTimeRange("3m")).toBe(true)
      expect(isTimeRange("2h")).toBe(true)
      expect(isTimeRange("2H")).toBe(true)
      expect(isTimeRange("1d")).toBe(true)
      expect(isTimeRange("1D")).toBe(true)
      expect(isTimeRange("1W")).toBe(true)
      expect(isTimeRange("1M")).toBe(true)
      expect(isTimeRange("1Y")).toBe(true)
    })

    test("支持英文全称（单数/复数）", () => {
      expect(isTimeRange("1 millisecond")).toBe(true)
      expect(isTimeRange("2 milliseconds")).toBe(true)
      expect(isTimeRange("1 second")).toBe(true)
      expect(isTimeRange("2 seconds")).toBe(true)
      expect(isTimeRange("1 minute")).toBe(true)
      expect(isTimeRange("2 minutes")).toBe(true)
      expect(isTimeRange("1 hour")).toBe(true)
      expect(isTimeRange("2 hours")).toBe(true)
      expect(isTimeRange("1 day")).toBe(true)
      expect(isTimeRange("2 days")).toBe(true)
    })

    test("非法字符串应返回 false", () => {
      expect(isTimeRange("abc")).toBe(false)
      expect(isTimeRange("1")).toBe(false)
      expect(isTimeRange("1x")).toBe(false)
      expect(isTimeRange("ms")).toBe(false)
    })
  })

  describe("parseTimeRange", () => {
    test("数字输入原样返回（单位：秒）", () => {
      expect(parseTimeRange(1)).toBe(1)
      expect(parseTimeRange(1.5)).toBe(1.5)
    })

    test("毫秒单位应换算为秒", () => {
      expect(parseTimeRange("1000ms")).toBe(1)
      expect(parseTimeRange("1000 milliseconds")).toBe(1)
      expect(parseTimeRange("1 millisecond")).toBe(0.001)
    })

    test("秒/分钟/小时/天等单位应正确换算", () => {
      expect(parseTimeRange("2s")).toBe(2)
      expect(parseTimeRange("2 seconds")).toBe(2)
      expect(parseTimeRange("3m")).toBe(180)
      expect(parseTimeRange("3 minutes")).toBe(180)
      expect(parseTimeRange("2h")).toBe(7200)
      expect(parseTimeRange("2 hours")).toBe(7200)
      expect(parseTimeRange("1d")).toBe(86400)
      expect(parseTimeRange("1 day")).toBe(86400)
    })

    test("W/M/Y（大写）应按约定换算", () => {
      expect(parseTimeRange("1W")).toBe(7 * 24 * 60 * 60)
      expect(parseTimeRange("1M")).toBe(30 * 24 * 60 * 60)
      expect(parseTimeRange("1Y")).toBe(365 * 24 * 60 * 60)
    })
  })

  describe("parseTimeRangeToSeconds / parseTimeRangeToMilliseconds", () => {

    test("parseTimeRangeToMilliseconds 应输出毫秒", () => {
      expect(parseTimeRangeToMilliseconds("1s")).toBe(1000)
      expect(parseTimeRangeToMilliseconds("1ms")).toBe(1)
      expect(parseTimeRangeToMilliseconds("1 millisecond")).toBe(1)
      expect(parseTimeRangeToMilliseconds(2)).toBe(2000)
    })
  })
})
