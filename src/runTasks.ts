export type RunTask<Input = undefined, Output = unknown> = (input: Input) => Output | PromiseLike<Output>

export type RunTasksOptions = {
  /**
   * sequential 会按数组顺序逐个执行；后一项 task 会收到前一项 task 的 resolved 结果。
   * parallel 会先同步调用全部 task，再等待全部结果。
   *
   * @default "sequential"
   */
  mode?: "sequential" | "parallel"
}

type SequentialOptions = { mode?: "sequential" }
type ParallelOptions = { mode: "parallel" }

/** 执行单个 task，并统一返回 Promise。 */
export async function runTask<Output>(task: RunTask<undefined, Output>): Promise<Awaited<Output>>
export async function runTask<Input, Output>(task: RunTask<Input, Output>, input: Input): Promise<Awaited<Output>>
export async function runTask<Input, Output>(task: RunTask<Input, Output>, input?: Input): Promise<Awaited<Output>> {
  return await task(input as Input)
}

/**
 * 执行一组 task，默认按数组顺序串行执行。
 *
 * 串行模式下，后一项 task 会收到前一项 task 的 resolved 结果。
 *
 * @example
 * const [id, user, label] = await runTasks([
 *   () => 1,
 *   (id) => fetchUser(id),
 *   (user) => user.name,
 * ])
 *
 * @example
 * const [user, profile] = await runTasks(
 *   [
 *     () => fetchUser(),
 *     () => fetchProfile(),
 *   ],
 *   { mode: "parallel" },
 * )
 */
export function runTasks<V1>(
  tasks: readonly [RunTask<undefined, V1>],
  options?: SequentialOptions,
): Promise<[Awaited<V1>]>
export function runTasks<V1, V2>(
  tasks: readonly [RunTask<undefined, V1>, RunTask<Awaited<V1>, V2>],
  options?: SequentialOptions,
): Promise<[Awaited<V1>, Awaited<V2>]>
export function runTasks<V1, V2, V3>(
  tasks: readonly [RunTask<undefined, V1>, RunTask<Awaited<V1>, V2>, RunTask<Awaited<V2>, V3>],
  options?: SequentialOptions,
): Promise<[Awaited<V1>, Awaited<V2>, Awaited<V3>]>
export function runTasks<V1, V2, V3, V4>(
  tasks: readonly [
    RunTask<undefined, V1>,
    RunTask<Awaited<V1>, V2>,
    RunTask<Awaited<V2>, V3>,
    RunTask<Awaited<V3>, V4>,
  ],
  options?: SequentialOptions,
): Promise<[Awaited<V1>, Awaited<V2>, Awaited<V3>, Awaited<V4>]>
export function runTasks<V1, V2, V3, V4, V5>(
  tasks: readonly [
    RunTask<undefined, V1>,
    RunTask<Awaited<V1>, V2>,
    RunTask<Awaited<V2>, V3>,
    RunTask<Awaited<V3>, V4>,
    RunTask<Awaited<V4>, V5>,
  ],
  options?: SequentialOptions,
): Promise<[Awaited<V1>, Awaited<V2>, Awaited<V3>, Awaited<V4>, Awaited<V5>]>
export function runTasks<V1, V2, V3, V4, V5, V6>(
  tasks: readonly [
    RunTask<undefined, V1>,
    RunTask<Awaited<V1>, V2>,
    RunTask<Awaited<V2>, V3>,
    RunTask<Awaited<V3>, V4>,
    RunTask<Awaited<V4>, V5>,
    RunTask<Awaited<V5>, V6>,
  ],
  options?: SequentialOptions,
): Promise<[Awaited<V1>, Awaited<V2>, Awaited<V3>, Awaited<V4>, Awaited<V5>, Awaited<V6>]>
export function runTasks<const Tasks extends readonly (() => any)[]>(
  tasks: Tasks,
  options: ParallelOptions,
): Promise<{ -readonly [Index in keyof Tasks]: Awaited<ReturnType<Tasks[Index]>> }>
export function runTasks<const Tasks extends readonly RunTask<any, any>[]>(
  tasks: Tasks,
  options?: RunTasksOptions,
): Promise<{ -readonly [Index in keyof Tasks]: Awaited<ReturnType<Tasks[Index]>> }>
export async function runTasks(
  tasks: readonly ((...args: any[]) => any)[],
  options: RunTasksOptions = {},
): Promise<any> {
  const mode = options.mode ?? "sequential"

  if (mode === "parallel") {
    return Promise.all(tasks.map((task) => runTask(task)))
  }

  const results: unknown[] = []
  let prev: unknown = undefined

  for (const task of tasks) {
    const result = await runTask(task, prev)
    results.push(result)
    prev = result
  }

  return results
}
