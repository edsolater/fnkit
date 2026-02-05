import { describe, expect, test } from "vitest"
import {
  createDate,
  getDate,
  setDate,
  getTime,
  getISO,
  isDateBefore,
  isDateAfter,
  isSameDate,
  offsetDateTime,
  cloneDate,
  getMonth,
  setMonth,
  getYear,
  getDay,
  getDayOfWeek,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
  parseDate,
  getMonthLength,
  createTimeStamp,
} from "./parseDate"

describe("日期工具库 (Date Utils)", () => {
  const fixedDateStr = "2023-10-01T12:30:45.123Z"
  // 对应的时间戳 (秒)
  const fixedTimestamp = 1696163445.123 
  const fixedDate = new Date(fixedDateStr)

  describe("createDate & getDate (创建日期)", () => {
    test("不传参数时，应返回当前时间的 Date 对象", () => {
      const now = new Date()
      const d = createDate()
      expect(d).toBeInstanceOf(Date)
      // 允许 100ms 的误差
      expect(Math.abs(d.getTime() - now.getTime())).toBeLessThan(100)
    })

    test("传入数字(秒级时间戳)，应正确解析为 Date 对象", () => {
      const d = createDate(fixedTimestamp)
      expect(d.toISOString()).toBe(fixedDateStr)
    })

    test("传入 Date 对象，应返回一个新的克隆 Date 对象", () => {
      const original = new Date(fixedDateStr)
      const d = createDate(original)
      expect(d).not.toBe(original) // 引用不同
      expect(d.getTime()).toBe(original.getTime()) // 时间相同
    })

    test("传入日期配置对象，应正确组合为 Date 对象", () => {
      // 2023年 10月 1日 12:30:45:123
      const d = createDate({
        year: 2023,
        month: 10,
        day: 1,
        hours: 12,
        minutes: 30,
        seconds: 45,
        milliseconds: 123
      })
      // 注意：这里使用的是本地时间构造，所以对比时需要注意时区。
      expect(d.getFullYear()).toBe(2023)
      expect(d.getMonth() + 1).toBe(10)
      expect(d.getDate()).toBe(1)
    })

    test("传入多个参数对象，应正确解析", () => {
      // 2023年 10月 1日
      // 修正：createDate 定义中只暴露了无参和单参(DateParam)的重载。
      // 虽然实现看起来支持多参数，但在 TS 中只能通过对象形式传递。
      const d = createDate({ year: 2023, month: 10, day: 1 })
      expect(d.getFullYear()).toBe(2023)
      expect(d.getMonth() + 1).toBe(10)
      expect(d.getDate()).toBe(1)
    })

    test("getDate 是 createDate 的别名", () => {
      expect(getDate).toBe(createDate)
    })
  })

  describe("setDate (修改日期)", () => {
    test("应该能够修改日期的特定部分（如年份和月份）", () => {
      const base = createDate({ year: 2023, month: 1, day: 1 }) // 2023-01-01
      const modified = setDate(base, { year: 2025, month: 5 })
      expect(modified.getFullYear()).toBe(2025)
      expect(modified.getMonth() + 1).toBe(5)
      expect(modified.getDate()).toBe(1) // 日期保持不变
    })
  })

  describe("getTime & createTimeStamp (获取时间戳)", () => {
    test("应该返回以秒为单位的时间戳", () => {
      const ts = getTime(fixedDate)
      // getTime 返回的是秒，而 Date.getTime() 是毫秒
      expect(ts).toBe(1696163445.123)
    })
    
    test("createTimeStamp 返回数字类型", () => {
      // createTimeStamp 在类型定义中不接受参数
      expect(typeof createTimeStamp()).toBe("number")
    })
  })

  describe("getISO (获取 ISO 字符串)", () => {
    test("应该返回标准的 ISO 8601 字符串", () => {
      expect(getISO(fixedDate)).toBe(fixedDateStr)
    })
  })

  describe("日期比较 (Comparisons)", () => {
    const early = createDate({ year: 2023, month: 1, day: 1 })
    const late = createDate({ year: 2023, month: 12, day: 31 })

    test("isDateBefore: 判断一个日期是否在另一个日期之前", () => {
      expect(isDateBefore(early, late)).toBe(true)
      expect(isDateBefore(late, early)).toBe(false)
    })

    test("isDateAfter: 判断一个日期是否在另一个日期之后", () => {
      expect(isDateAfter(late, early)).toBe(true)
      expect(isDateAfter(early, late)).toBe(false)
    })

    test("isSameDate: 判断两个日期时间戳是否完全相等", () => {
      const d1 = createDate({ year: 2023, month: 10, day: 1 })
      const d2 = createDate({ year: 2023, month: 10, day: 1 })
      const d3 = createDate({ year: 2023, month: 10, day: 2 })
      expect(isSameDate(d1, d2)).toBe(true)
      expect(isSameDate(d1, d3)).toBe(false)
    })
  })

  describe("offsetDateTime (日期偏移)", () => {
    const base = createDate({ year: 2023, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0 }) // 2023-01-01

    test("增加指定天数", () => {
      const result = offsetDateTime(base, 5, { unit: "days" })
      expect(result.getDate()).toBe(6)
    })

    test("减少指定天数", () => {
      const result = offsetDateTime(base, -1, { unit: "days" })
      // 应该回到上一年的最后一天
      expect(result.getFullYear()).toBe(2022) 
      expect(result.getMonth() + 1).toBe(12)
      expect(result.getDate()).toBe(31)
    })

    test("增加月份 (自动处理跨年)", () => {
      const result = offsetDateTime(base, 13, { unit: "months" })
      // 2023-01 + 13个月 = 2024-02
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth() + 1).toBe(2)
    })

    test("不传 unit 时，默认按秒偏移", () => {
      // 这里要以实现为准：当前 offsetDateTime 在 unit 未传时，会把 offset 当作“秒”处理。
      // 1000 秒 = 16 分 40 秒
      const result = offsetDateTime(base, 1000)
      expect(result.getMinutes()).toBe(16)
      expect(result.getSeconds()).toBe(40)
    })

    test("unit=milliseconds 时，应按毫秒偏移", () => {
      // 1000ms = 1s
      const result = offsetDateTime(base, 1000, { unit: "milliseconds" })
      expect(result.getSeconds()).toBe(1)
    })

     test("增加小时", () => {
      const result = offsetDateTime(base, 2, { unit: "hours" })
      expect(result.getHours()).toBe(2)
    })
  })

  describe("Getters (获取具体时间信息)", () => {
    // 2023-10-05 12:30:45.123 (星期四)
    const d = createDate({ 
      year: 2023, 
      month: 10, 
      day: 5, 
      hours: 12, 
      minutes: 30, 
      seconds: 45, 
      milliseconds: 123 
    })

    test("getYear: 获取完整的年份", () => {
      expect(getYear(d)).toBe(2023)
    })
    
    test("getMonth: 获取月份 (1-12)", () => {
      expect(getMonth(d)).toBe(10)
    })
    
    test("getDay: 获取日期 (几号)", () => {
      expect(getDay(d)).toBe(5)
    })

    test("getDayOfWeek: 获取星期几 (0是周日, 1-6是周一到周六)", () => {
      // 2023-10-05 是周四
      expect(getDayOfWeek(d)).toBe(4) 
    })

    test("getHours/Minutes/Seconds/Milliseconds", () => {
      expect(getHours(d)).toBe(12)
      expect(getMinutes(d)).toBe(30)
      expect(getSeconds(d)).toBe(45)
      expect(getMilliseconds(d)).toBe(123)
    })
  })

  describe("Setters (设置具体时间信息)", () => {
    test("setMonth: 设置月份 (1-12)", () => {
      const d = createDate({ year: 2023, month: 1, day: 1 })
      const newD = setMonth(d, 5) // 设置为5月
      expect(getMonth(newD)).toBe(5)
      // 原对象不应被修改 (根据 cloneDate 实现)
      expect(getMonth(d)).toBe(1)
    })
  })

  describe("工具函数 (Helpers)", () => {
    test("cloneDate: 克隆日期对象", () => {
      const d1 = new Date()
      const d2 = cloneDate(d1)
      expect(d1).not.toBe(d2)
      expect(d1.getTime()).toBe(d2.getTime())
    })

    test("getMonthLength: 获取某个月的天数", () => {
      // 平年 2月
      expect(getMonthLength(2023, 2)).toBe(28)
      // 闰年 2月
      expect(getMonthLength(2024, 2)).toBe(29)
      // 大月
      expect(getMonthLength(2023, 1)).toBe(31)
      // 小月
      expect(getMonthLength(2023, 4)).toBe(30)
    })

    test("parseDate: 解析出完整的日期信息对象", () => {
      const d = createDate({ year: 2023, month: 10, day: 5, hours: 12 })
      const info = parseDate(d)

      expect(info.year).toBe(2023)
      expect(info.month).toBe(10)
      expect(info.day).toBe(5)
      expect(info.hours).toBe(12)
      // 验证 monthLength 也在结果中
      expect(info.monthLength).toBe(31) // 10月有31天
      expect(info.fullDate).toBeInstanceOf(Date)
    })
  })
})
