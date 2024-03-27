import type { MayPromise } from "./typings"

type Task<Result, Prev = any> = (utils: {
  prev: Prev extends void ? any : Prev // richer this type with `NoInfer<>`(https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/#the-noinfer-utility-type)
  next(v?: any): Promise<any> // richer this type with `NoInfer<>`(https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/#the-noinfer-utility-type)
}) => Result | Promise<Result> | void | Promise<void>

/**
 * if result is void | Promise void, runTasks should wait until `next()` is invoked (maybe in a callback)
 * `return`'s priority is higher than `next()`
 * @example
 * 
const async4 = new Promise<number>((res) => {
  setTimeout(() => {
    res(4)
  }, 100)
})

runTasks(
  () => async4,
  ({ prev, next }) => {
    console.log("start task 1", prev) // expect 4
    next(prev + 2)
  },
  ({ prev, next }) => {
    console.log("start task 2: ", prev) // expect 6
    setTimeout(() => {
      next(prev + 3)
    }, 1000)
    return 3
  },
  ({ prev: v }) => {
    console.log("v: ", v) // expect to be 3
  },
)

 */
export async function runTasks<V1>(...tasks: [Task<V1, undefined>]): Promise<V1>
export async function runTasks<V1, V2>(...tasks: [Task<V1, undefined>, Task<V2, V1>]): Promise<V2>
export async function runTasks<V1, V2, V3>(...tasks: [Task<V1, undefined>, Task<V2, V1>, Task<V3, V2>]): Promise<V3>
export async function runTasks<V1, V2, V3, V4>(
  ...tasks: [Task<V1, undefined>, Task<V2, V1>, Task<V3, V2>, Task<V4, V3>]
): Promise<V4>
export async function runTasks<V1, V2, V3, V4, V5>(
  ...tasks: [Task<V1, undefined>, Task<V2, V1>, Task<V3, V2>, Task<V4, V3>, Task<V5, V4>]
): Promise<V5>
export async function runTasks<V>(...tasks: Task<V>[]): Promise<V> {
  let resolve
  let reject
  const finalResult = new Promise<V>((res, rej) => {
    resolve = res
    reject = rej
  })

  let prev: any = undefined
  let ongoingTaskIndex = { idx: 0 } // to avoid closure trap

  async function setPrevTaskResult(result: MayPromise<any>, idx: number) {
    prev = await result
    // check if need to set finalResult also
    if (idx === tasks.length - 1) {
      resolve(prev)
    }
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    ongoingTaskIndex.idx = i
    const returnedResult = await task({
      prev,
      next: async (value: any) => {
        const v = await value
        if (i === ongoingTaskIndex.idx) {
          await setPrevTaskResult(v, i + 1)
        }
      },
    })

    if (returnedResult !== undefined || i === tasks.length - 1) {
      await setPrevTaskResult(returnedResult, i)
    }
  }
  return finalResult
}

// function handleCallback<T, P = any>(task: (v, utils: { next(value?: any): void }) => void) {
//   return (prev: P) =>
//     new Promise<T>((res) => {
//       task(prev, {
//         next(value) {
//           res(value)
//         },
//       })
//     })
// }
