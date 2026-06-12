import { describe, expect, test, vi } from "vitest"
import { assert, assertVariable, tryAssert } from "./oldMethodsMagic"

/**
 * assert 是底层断言工具，测试重点不是“调用不报错”，而是把输入形态、失败分支、
 * callback payload 和错误传播顺序表达清楚。
 *
 * 当前已覆盖：普通值、条件函数、Promise、message、callback、同步抛错、
 * Promise reject、条件函数返回 Promise。
 *
 * 未展开成矩阵的低优先级边界：所有 falsy 值逐一枚举、callback 自身抛错、
 * 异步 callback reject、无 message 时 Error.message 的精确字符串。
 */
describe("assert", () => {
  test("同步条件为真时不抛错", () => {
    expect(() => assert(true, "不应该抛错")).not.toThrow()
  })

  test("普通对象、数组、Map、Set 都可以直接作为同步断言值", () => {
    expect(() => assert({ ok: true }, "对象不应该抛错")).not.toThrow()
    expect(() => assert([1], "数组不应该抛错")).not.toThrow()
    expect(() => assert(new Map([["ok", true]]), "Map 不应该抛错")).not.toThrow()
    expect(() => assert(new Set([1]), "Set 不应该抛错")).not.toThrow()
  })

  test("同步条件函数返回真时不抛错", () => {
    expect(() => assert(() => 1, "不应该抛错")).not.toThrow()
  })

  test("同步条件函数返回假时抛出指定错误信息", () => {
    const callback = vi.fn()

    expect(() => assert(() => false, "函数断言失败", callback)).toThrow("函数断言失败")
    expect(callback).toHaveBeenCalledWith({ value: false, message: "函数断言失败" })
  })

  test("同步条件为假时抛出指定错误信息", () => {
    expect(() => assert(false, "断言失败")).toThrow("断言失败")
  })

  test("同步条件为假时会先调用回调并传入当前值和错误信息", () => {
    const callback = vi.fn()

    expect(() => assert(0, "不是有效值", callback)).toThrow("不是有效值")
    expect(callback).toHaveBeenCalledWith({ value: 0, message: "不是有效值" })
  })

  test("同步条件为假且第二参数是回调时，会调用回调并抛出空消息错误", () => {
    const callback = vi.fn()

    expect(() => assert(false, callback)).toThrow()
    expect(callback).toHaveBeenCalledWith({ value: false, message: undefined })
  })

  test("同步条件函数抛错时透出原错误", () => {
    expect(() =>
      assert(() => {
        throw new Error("条件函数失败")
      }),
    ).toThrow("条件函数失败")
  })

  test("异步条件 resolve 为真时正常完成", async () => {
    await expect(assert(Promise.resolve("ok"), "不应该抛错")).resolves.toBeUndefined()
  })

  test("异步条件 resolve 为假时会等待回调后抛错", async () => {
    const callback = vi.fn(async () => undefined)

    await expect(assert(Promise.resolve(0), "异步断言失败", callback)).rejects.toThrow("异步断言失败")
    expect(callback).toHaveBeenCalledWith({ value: 0, message: "异步断言失败" })
  })

  test("异步条件 resolve 为假且第二参数是回调时，会调用回调并抛出空消息错误", async () => {
    const callback = vi.fn(async () => undefined)

    await expect(assert(Promise.resolve(false), callback)).rejects.toThrow()
    expect(callback).toHaveBeenCalledWith({ value: false, message: undefined })
  })

  test("异步条件 reject 时透出原错误且不调用断言回调", async () => {
    const callback = vi.fn()

    await expect(assert(Promise.reject(new Error("异步条件失败")), "不会使用", callback)).rejects.toThrow("异步条件失败")
    expect(callback).not.toHaveBeenCalled()
  })

  test("条件函数返回 Promise 时按异步断言处理", async () => {
    const callback = vi.fn()

    await expect(assert(() => Promise.resolve(false), "函数异步断言失败", callback)).rejects.toThrow("函数异步断言失败")
    expect(callback).toHaveBeenCalledWith({ value: false, message: "函数异步断言失败" })
  })
})

describe("assertVariable", () => {
  test("默认按 truthy 判断变量，通过时不输出日志", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    expect(() => assertVariable("value")).not.toThrow()
    expect(logSpy).not.toHaveBeenCalled()

    logSpy.mockRestore()
  })

  test("默认按 truthy 判断变量，失败时输出变量并抛错", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    expect(() => assertVariable(0)).toThrow()
    expect(logSpy).toHaveBeenCalledWith(0)

    logSpy.mockRestore()
  })

  test("传入 message 时失败会输出 message 和变量", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    expect(() => assertVariable("", "不能为空")).toThrow("不能为空")
    expect(logSpy).toHaveBeenCalledWith("不能为空", "")

    logSpy.mockRestore()
  })

  test("传入 message 函数时失败会使用函数返回值作为错误信息", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const message = (value: string) => `不能为空：${value}`

    expect(() => assertVariable("", message)).toThrow("不能为空：")
    expect(logSpy).toHaveBeenCalledWith(message, "")

    logSpy.mockRestore()
  })

  test("传入 when 和 message 时，条件通过不会输出日志", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    expect(() => assertVariable(5, (value) => value > 3, "数值过小")).not.toThrow()
    expect(logSpy).not.toHaveBeenCalled()

    logSpy.mockRestore()
  })

  test("传入 when 和 message 函数时，按自定义条件判断并生成消息", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const message = (value: number) => `数值过小：${value}`

    expect(() => assertVariable(2, (value) => value > 3, message)).toThrow("数值过小：2")
    expect(logSpy).toHaveBeenCalledWith(message, 2)

    logSpy.mockRestore()
  })

  test("自定义 when 抛错时透出原错误且不输出日志", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined)

    expect(() =>
      assertVariable(1, () => {
        throw new Error("判断失败")
      }, "不会使用"),
    ).toThrow("判断失败")
    expect(logSpy).not.toHaveBeenCalled()

    logSpy.mockRestore()
  })
})

describe("tryAssert", () => {
  test("任务成功时返回任务结果", () => {
    expect(tryAssert(() => 42)).toBe(42)
  })

  test("任务抛错时沿用当前 tryCatch 行为重新抛出原错误", () => {
    expect(() =>
      tryAssert(() => {
        throw new Error("任务失败")
      }),
    ).toThrow("任务失败")
  })

  test("任务成功但 assertCondition 不通过时抛出 catchFunction 字符串", () => {
    expect(() => tryAssert(() => "ok", "状态不满足", () => false)).toThrow("状态不满足")
  })

  test("任务成功时 assertCondition 会收到 undefined 错误对象", () => {
    const assertCondition = vi.fn(() => true)

    expect(tryAssert(() => "ok", "不应该抛错", assertCondition)).toBe("ok")
    expect(assertCondition).toHaveBeenCalledWith(undefined)
  })

  test("任务成功但 assertCondition 不通过时，会调用 catchFunction 生成错误信息", () => {
    const catchFunction = vi.fn((err: Error | undefined) => `状态不满足：${String(err)}`)

    expect(() => tryAssert(() => "ok", catchFunction, () => false)).toThrow("状态不满足：undefined")
    expect(catchFunction).toHaveBeenCalledWith(undefined)
  })

  test("任务抛错且 catchFunction 是字符串时，仍透出原错误", () => {
    expect(() =>
      tryAssert(
        () => {
          throw new Error("原始失败")
        },
        "不会替换原错误",
      ),
    ).toThrow("原始失败")
  })

  test("任务抛出非 Error 值时，会包装成 Error 后抛出", () => {
    expect(() =>
      tryAssert(() => {
        throw "字符串错误"
      }),
    ).toThrow("字符串错误")
  })
})
