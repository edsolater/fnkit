import type { MayPromise } from "./typings"

type AsyncAction<T, P = any> = ((arg: P) => Promise<T> | T) | Promise<T> | T

/**
 * different from {@link pipeDo} in 2 points
 * - this function accept promise result, but input prev result always is sync
 * - each task in it will run only  prev is done (means, if prev return a promise, next task will wait it done)
 * 
 * if task is callback-base not promise, you can use {@link handleCallback} to wrap it
 * @example
 * 
 * // for test
const async4 = new Promise<number>((res) => {
  setTimeout(() => {
    res(4)
  }, 1000)
})

const actionResult = pipeAsyncDo(
  async4,
  (v) => {
    console.log("start task 1", v)
    return Promise.resolve(2 + v)
  },
  async (v) => {
    console.log("start task 2", v)
    return v + 1
  },
  (v) => {
    console.log("v: ", v) // expect 7 (4+2+1)
  },
)
 * 
 */

export async function pipeAsyncDo<V, V1>(v: MayPromise<V1>, ...actions: [action1: AsyncAction<V, V1>]): Promise<V1>
export async function pipeAsyncDo<V, V1, V2>(
  v: MayPromise<V1>,
  ...actions: [action1: AsyncAction<V, V1>, action2: AsyncAction<V2, V1>]
): Promise<V2>
export async function pipeAsyncDo<V, V1, V2, V3>(
  v: MayPromise<V1>,
  ...actions: [action1: AsyncAction<V, V1>, action2: AsyncAction<V2, V1>, action3: AsyncAction<V3, V2>]
): Promise<V3>
export async function pipeAsyncDo<V, V1, V2, V3, V4>(
  v: MayPromise<V1>,
  ...actions: [
    action1: AsyncAction<V, V1>,
    action2: AsyncAction<V2, V1>,
    action3: AsyncAction<V3, V2>,
    action4: AsyncAction<V4, V3>,
  ]
): Promise<V4>
export async function pipeAsyncDo<V, V1, V2, V3, V4, V5>(
  v: MayPromise<V1>,
  ...actions: [
    action1: AsyncAction<V, V1>,
    action2: AsyncAction<V2, V1>,
    action3: AsyncAction<V3, V2>,
    action4: AsyncAction<V4, V3>,
    action5: AsyncAction<V5, V4>,
  ]
): Promise<V5>
export async function pipeAsyncDo<T>(v: MayPromise<T>, actions: AsyncAction<T>[]): Promise<T> {
  let result = v
  for (const task of actions) {
    // @ts-ignore
    result = await shrinkFn(task, [result])
  }
  return result
}
