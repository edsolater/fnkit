import type { AnyFn } from "../typings"

type TaskResult<T> = T | Promise<T>
type Exec<T, U = any> = (pastTaskValue: U) => TaskResult<T>
type Taskable<T, U = any> = TaskResult<T> | Task<T> | Exec<T, U>

type InnerTaskState<T> = {
  is: "pending" | "fulfilled" | "rejected" | "running"
  value?: T
  error?: any
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
  private async executeThisTask(payload: { prevValue: U }): Promise<T> {
    const taskStartTime = globalThis.Performance?.now?.()
    try {
      const result = await this.execFn(payload.prevValue)
      this.taskState.is = "fulfilled"
      this.taskState.value = result
      Promise.resolve().then(() => {
        this.taskState.registeredCallbacks.onFulfilled?.forEach((fn) => fn?.(result))
        this.taskState.registeredCallbacks.onFinally?.forEach((fn) => fn?.())
      })
      const taskEndTime = globalThis.Performance?.now?.()
      this.taskState.taskRunMs = taskEndTime - taskStartTime
      return result
    } catch (e) {
      this.taskState.is = "rejected"
      this.taskState.error = e
      Promise.resolve().then(() => {
        this.taskState.registeredCallbacks.onRejected?.forEach((fn) => fn?.(e))
        this.taskState.registeredCallbacks.onFinally?.forEach((fn) => fn?.())
      })
      const taskEndTime = globalThis.Performance?.now?.()
      this.taskState.taskRunMs = taskEndTime - taskStartTime
      return Promise.reject(e)
    }
  }

  // /** 假运行：不启动计算，仅返回一个 Promise（用于链式衔接） */
  // fakeRun(): Promise<T> {
  //   return new Promise<T>((resolve, reject) => {
  //     this.taskState.registeredCallbacks.onFulfilled.push(resolve)
  //     this.taskState.registeredCallbacks.onRejected.push(reject)
  //     this.taskState.registeredCallbacks.onFinally.push(undefined)
  //   })
  // }
  async run(): Promise<T> {
    let taskResult: any = undefined
    for (const parentTask of this.taskState.parentTasks.concat(this)) {
      taskResult = await parentTask.executeThisTask({ prevValue: taskResult })
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
}

/* Guard函数 */
export function isTask<T>(obj: any): obj is Task<T> {
  return obj instanceof Task
}

/* 快捷函数 */
export function task<T>(fn: Exec<T> | Task<T>): Task<T> {
  return Task.from(fn)
}
