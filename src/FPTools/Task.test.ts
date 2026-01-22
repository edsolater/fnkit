import { expect, test, vi } from "vitest"
import { Task } from "./Task"

test("Task.of should create a task that resolves with the given value", async () => {
  const task = Task.from(() => Promise.resolve(32))
  const result = await task.run()
  expect(result).toBe(42)
})
