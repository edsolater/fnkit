import { expect, test, vi } from "vitest"
import { Task } from "./Task"

test("Task.of should create a task that resolves with the given value", async () => {
  const task = Task.of(42)
  const result = await task.run()
  expect(result).toBe(42)
})

test("Task.from should create a task from a value", async () => {
  const task = Task.from(42)
  const result = await task.run()
  expect(result).toBe(42)
})

test("Task.from should create a task from a promise", async () => {
  const task = Task.from(Promise.resolve(42))
  const result = await task.run()
  expect(result).toBe(42)
})

test("Task.from should create a task from a function", async () => {
  const task = Task.from(() => 42)
  const result = await task.run()
  expect(result).toBe(42)
})

test("Task should be lazy", async () => {
  const fn = vi.fn()
  const task = Task.from(fn)
  expect(fn).not.toHaveBeenCalled()
  await task.run()
  expect(fn).toHaveBeenCalledTimes(1)
})

test("chain should sequence tasks", async () => {
  const task = Task.of(2)
    .chain((x) => x * 2)
    .chain((x) => x + 1)
  const result = await task.run()
  expect(result).toBe(5)
})

test("chain should handle async functions", async () => {
  const task = Task.of(2).chain(async (x) => {
    await new Promise((resolve) => setTimeout(resolve, 10))
    return x * 2
  })
  const result = await task.run()
  expect(result).toBe(4)
})

test("run should execute the task chain", async () => {
  let value = 0
  const task = Task.from(() => {
    value = 1
    return value
  }).chain((x) => {
    value = x + 1
    return value
  })

  expect(value).toBe(0)
  const result = await task.run()
  expect(result).toBe(2)
  expect(value).toBe(2)
})

test("should handle rejections", async () => {
  const error = new Error("Something went wrong")
  const task = Task.from(() => Promise.reject(error))
  await expect(task.run()).rejects.toThrow(error)
})

test("chain should handle rejections in the middle of the chain", async () => {
  const error = new Error("Something went wrong")
  const fn = vi.fn()
  const task = Task.of(1)
    .chain(() => {
      throw error
    })
    .chain(fn)

  await expect(task.run()).rejects.toThrow(error)
  expect(fn).not.toHaveBeenCalled()
})

test("on 'fulfilled' should register a callback for successful execution", async () => {
  const onFulfilled = vi.fn()
  const task = Task.of(42).on("fulfilled", onFulfilled)
  await task.run()
  expect(onFulfilled).toHaveBeenCalledWith(42)
})

test("on 'rejected' should register a callback for failed execution", async () => {
  const error = new Error("test error")
  const onRejected = vi.fn()
  const task = Task.from(() => {
    throw error
  }).on("rejected", onRejected)

  await task.run().catch(() => {})
  expect(onRejected).toHaveBeenCalledWith(error)
})

test("on 'finally' should register a callback that runs on fulfilled", async () => {
  const onFinally = vi.fn()
  const task = Task.of(42).on("finally", onFinally)
  await task.run()
  expect(onFinally).toHaveBeenCalled()
})

test("on 'finally' should register a callback that runs on rejected", async () => {
  const onFinally = vi.fn()
  const task = Task.from(() => {
    throw new Error("test")
  }).on("finally", onFinally)
  await task.run().catch(() => {})
  expect(onFinally).toHaveBeenCalled()
})

// TODO: Future feature proposals

// A `map` function would be a good addition.
// It is similar to `chain`, but it doesn't require wrapping the return value in a Task.
// test('map should transform the value', async () => {
//   const task = Task.of(2).map(x => x * 2);
//   const result = await task.run();
//   expect(result).toBe(4);
// });

// `delay` could be useful for adding delays into the task chain.
// test('delay should pause execution', async () => {
//   const start = Date.now();
//   const task = Task.of(1).delay(100);
//   await task.run();
//   const end = Date.now();
//   expect(end - start).toBeGreaterThanOrEqual(100);
// });

// `retry` for tasks that might fail.
// test('retry should re-run the task on failure', async () => {
//   let attempts = 0;
//   const task = Task.from(() => {
//     attempts++;
//     if (attempts < 3) {
//       return Promise.reject('fail');
//     }
//     return Promise.resolve('success');
//   }).retry({ retries: 3 });
//
//   const result = await task.run();
//   expect(result).toBe('success');
//   expect(attempts).toBe(3);
// });

// `orElse` to provide a fallback task
// test('orElse should run the fallback task on failure', async () => {
//   const failingTask = Task.from(() => Promise.reject('fail'));
//   const fallbackTask = Task.of('fallback');
//   const task = failingTask.orElse(() => fallbackTask);
//
//   const result = await task.run();
//   expect(result).toBe('fallback');
// });

// Applicative `ap` for running tasks in parallel.
// test('ap should apply a function in a task to a value in another task', async () => {
//   const fnTask = Task.of((x: number) => x * 2);
//   const valueTask = Task.of(21);
//   const resultTask = valueTask.ap(fnTask);
//   const result = await resultTask.run();
//   expect(result).toBe(42);
// });
