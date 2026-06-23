import { describe, expect, expectTypeOf, test } from "vitest"
import { runTask, runTasks } from "./runTasks"

describe("runTask()", () => {
  test("runTask 可以执行单个同步 task，并统一返回 Promise", async () => {
    const result = await runTask(() => 1)

    expect(result).toBe(1)
  })

  test("runTask 可以把输入值传给单个 task", async () => {
    const result = await runTask((value: number) => value + 1, 1)

    expect(result).toBe(2)
  })

  test("runTask 可以执行单个异步 task", async () => {
    const result = await runTask(async () => "task result")

    expect(result).toBe("task result")
  })
})

describe("runTasks()", () => {
  test("默认按数组顺序串行执行 task，并返回所有结果", async () => {
    const events: string[] = []

    const result = await runTasks([
      async () => {
        events.push("task1 start")
        await Promise.resolve()
        events.push("task1 end")
        return 1
      },
      () => {
        events.push("task2")
        return 2
      },
    ])

    expect(result).toEqual([1, 2])
    expect(events).toEqual(["task1 start", "task1 end", "task2"])
  })

  test("串行模式会把前一个 task 的结果传给后一个 task", async () => {
    const result = await runTasks([
      () => 2,
      (value) => `${value + 1}`,
      (value) => value.length === 1,
    ])

    expect(result).toEqual([2, "3", true])
    expectTypeOf(result).toEqualTypeOf<[number, string, boolean]>()
  })

  test("串行模式会把异步 task 的 resolved 结果传给下一个 task", async () => {
    const result = await runTasks([
      async () => 1,
      (value) => value + 1,
      async (value) => `${value}`,
    ])

    expect(result).toEqual([1, 2, "2"])
    expectTypeOf(result).toEqualTypeOf<[number, number, string]>()
  })

  test("sequential 模式和默认模式一致", async () => {
    const events: string[] = []

    const result = await runTasks(
      [
        async () => {
          events.push("task1 start")
          await Promise.resolve()
          events.push("task1 end")
          return "a"
        },
        (value) => {
          events.push(`task2 ${value}`)
          return "b"
        },
      ],
      { mode: "sequential" },
    )

    expect(result).toEqual(["a", "b"])
    expect(events).toEqual(["task1 start", "task1 end", "task2 a"])
  })

  test("parallel 模式会先同步调用全部 task，再等待全部结果", async () => {
    const events: string[] = []

    const result = await runTasks(
      [
        async () => {
          events.push("task1 start")
          await Promise.resolve()
          events.push("task1 end")
          return 1
        },
        () => {
          events.push("task2")
          return 2
        },
      ],
      { mode: "parallel" },
    )

    expect(result).toEqual([1, 2])
    expect(events).toEqual(["task1 start", "task2", "task1 end"])
    expectTypeOf(result).toEqualTypeOf<[number, number]>()
  })
})