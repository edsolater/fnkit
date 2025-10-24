import { isFunction } from "../dataType"
import type { AnyFn, MayFn } from "../typings"

type TaskResult<T> = T | Promise<T>
type Exec<T, U = any> = (pastTaskValue: U) => TaskResult<T>
type Taskable<T, U = any> = TaskResult<T> | Task<T> | Exec<T, U>

type InnerTaskState<T> = {
  is: "pending" | "fulfilled" | "rejected" | "running" | "aborted" /* 冻结状态，不可再执行 */
  value?: T
  error?: any
  /** 由 catch 注入 */
  fallback?: (error: any) => T | Promise<T>
  taskRunMs?: number
  parentTasks: Task<any>[] // 尚未执行的任务（基于此状态派生，供状态变更时通知更新）// 只有上一个任务执行完毕且成功了才可以进行下一个任务。
  registeredCallbacks: {
    onFulfilled?: ((value: T) => void)[]
    onRejected?: ((error: any) => void)[]
    onFinally?: (() => void)[]
  }
}

/**
 * 异步任务封装类（兼容于 Promise，但保持惰性，且可链式衔接， 并提供一些方便的管理接口）
 */
export class Task<T, U = any> {
  taskState: InnerTaskState<T>
  constructor(
    private readonly execFn: Exec<T, U>,
    inputState: InnerTaskState<T> = {
      is: "pending",
      parentTasks: [],
      registeredCallbacks: { onFulfilled: [], onRejected: [], onFinally: [] },
    },
  ) {
    this.taskState = inputState
  }

  /** 仅包装一个已知值（不做任何计算） */
  static of<T>(value: TaskResult<T>): Task<T> {
    if (value instanceof Task) {
      return value
    } else {
      return new Task(() => value)
    }
  }

  /** 从函数/Promise/值“解释”为 Task；统一入口 */
  static from<T, U = any>(src: Taskable<T, U>): Task<T, U> {
    if (src instanceof Task) return src
    if (typeof src === "function") {
      return new Task(src as Exec<T, U>)
    }
    return new Task(() => src)
  }

  /** 真正启动过程，返回一个可等待的 Promise */
  private async runCurrentTask(payload: { prevValue: U }): Promise<T> {
    // 以标注为取消的任务不可再执行
    if (this.taskState.is === "aborted") return Promise.reject(this.taskState.error)

    this.taskState.is = "running"
    const {
      promise: CurrentTaskResultPromise,
      resolve: CurrentTaskResultResolve,
      reject: CurrentTaskResultReject,
    } = Promise.withResolvers<T>()
    const finalCore = (payload: { prevValue: U }) => {
      const taskStartTime = globalThis.Performance?.now?.()
      const { promise: costTimePromise, resolve: costTimeResolve } = Promise.withResolvers<number>()
      const result = Promise.resolve()
        .then(() => this.execFn(payload.prevValue))
        .catch((e) => {
          if (this.taskState.fallback) {
            return this.taskState.fallback(e)
          } else {
            return Promise.reject(e)
          }
        })
        .finally(() => {
          costTimeResolve(globalThis.Performance?.now?.() - taskStartTime)
        })

      return { result, costTime: costTimePromise }
    }
    const { result, costTime } = finalCore({ prevValue: payload.prevValue })
    Promise.allSettled([result, costTime]).then(([resResult, resCostTime]) => {
      this.taskState.taskRunMs = resCostTime.status === "fulfilled" ? resCostTime.value : NaN
      if (resResult.status === "fulfilled") {
        this.taskState.is = "fulfilled"
        this.taskState.value = resResult.value
        Promise.resolve().then(() => {
          this.taskState.registeredCallbacks.onFulfilled?.forEach((fn) => fn?.(resResult.value))
          this.taskState.registeredCallbacks.onFinally?.forEach((fn) => fn?.())
        })
        CurrentTaskResultResolve(resResult.value)
      } else {
        this.taskState.is = "rejected"
        this.taskState.error = resResult.reason
        Promise.resolve().then(() => {
          this.taskState.registeredCallbacks.onRejected?.forEach((fn) => fn?.(resResult.reason))
          this.taskState.registeredCallbacks.onFinally?.forEach((fn) => fn?.())
        })
        CurrentTaskResultReject(resResult.reason)
      }
    })

    return CurrentTaskResultPromise
  }

  // /** 假运行：不启动计算，仅返回一个 Promise（用于链式衔接） */
  // fakeRun(): Promise<T> {
  //   return new Promise<T>((resolve, reject) => {
  //     this.taskState.registeredCallbacks.onFulfilled.push(resolve)
  //     this.taskState.registeredCallbacks.onRejected.push(reject)
  //     this.taskState.registeredCallbacks.onFinally.push(undefined)
  //   })
  // }
  async run(payload?: { prevValue?: U }): Promise<T> {
    let taskResult: any = payload?.prevValue
    for (const parentTask of this.taskState.parentTasks.concat(this)) {
      taskResult = await parentTask.runCurrentTask({ prevValue: taskResult })
    }
    return taskResult
  }

  /** 注册回调 */
  on(time: "fulfilled", callback: (result: T) => void): Task<T>
  on(time: "rejected", callback: (error: any) => void): Task<T>
  on(time: "finally", callback: () => void): Task<T>
  on(time: "fulfilled" | "rejected" | "finally", callback: AnyFn): Task<T> {
    switch (time) {
      case "fulfilled":
        this.taskState.registeredCallbacks.onFulfilled ??= []
        this.taskState.registeredCallbacks.onFulfilled.push(callback)
        break
      case "rejected":
        this.taskState.registeredCallbacks.onRejected ??= []
        this.taskState.registeredCallbacks.onRejected.push(callback)
        break
      case "finally":
        this.taskState.registeredCallbacks.onFinally ??= []
        this.taskState.registeredCallbacks.onFinally.push(callback)
        break
    }
    return this
  }

  /** 链式衔接下一个 Task（flatMap/chain） */
  chain<V>(taskable: Taskable<V, T>): Task<V, T> {
    const newTask = Task.from<V, T>(taskable)
    newTask.taskState.parentTasks = this.taskState.parentTasks.concat(this)
    return newTask
  }

  private abortCurrentTask(): void {
    this.taskState.is = "aborted"
    this.taskState.error = new Error("This task has been aborted and cannot be executed.")
  }

  /** 中止任务（不可再执行） */
  abort(): void {
    this.taskState.parentTasks
      .concat(this)
      .toReversed()
      .forEach((task) => task.abortCurrentTask())
  }

  /** 如果任务失败， 捕获错误并返回默认值 */
  catch(defaultValue: T | Promise<T> | ((error: any) => T | Promise<T>)): Task<T, U> {
    this.taskState.fallback = isFunction(defaultValue) ? defaultValue : () => defaultValue
    return this
  }
}

/* Guard函数 */
export function isTask<T>(obj: any): obj is Task<T> {
  return obj instanceof Task
}

/* 快捷函数 */
export function task<T>(fn: Taskable<T>): Task<T> {
  return Task.from(fn)
}

/** 并行处理多个task */
export function taskGroup<T>(fn1: Taskable<T>): Task<[T]>
export function taskGroup<T, U>(fn1: Taskable<T>, fn2: Taskable<U>): Task<[T, U]>
export function taskGroup<T, U, V>(fn1: Taskable<T>, fn2: Taskable<U>, fn3: Taskable<V>): Task<[T, U, V]>
export function taskGroup<T, U, V, W>(
  fn1: Taskable<T>,
  fn2: Taskable<U>,
  fn3: Taskable<V>,
  fn4: Taskable<W>,
): Task<[T, U, V, W]>
export function taskGroup<T, U, V, W, X>(
  fn1: Taskable<T>,
  fn2: Taskable<U>,
  fn3: Taskable<V>,
  fn4: Taskable<W>,
  fn5: Taskable<X>,
): Task<[T, U, V, W, X]>
export function taskGroup(...fns: Taskable<any>[]): Task<any> {
  const tasks = fns.map((fn) => Task.from(fn))
  return new Task((prevValue: any) => {
    const promises = tasks.map((task) => task.run({ prevValue }))
    return Promise.all(promises)
  })
}
