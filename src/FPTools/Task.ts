import { assert } from "../oldMethodsMagic"
import type { AnyFn, ID } from "../typings"
import { StateSignalManager } from "./StateSignalManager"

type TaskResult<T> = T | Promise<T>
type TaskInnerFunction<T, U = any> = (prevTaskResult: U) => TaskResult<T>
type Taskable<T, U = any> = TaskResult<T> | Task<T> | TaskInnerFunction<T, U>

type TaskLifeCycle =
  | "idle"
  | "running"
  | "paused"
  | "aborted" /* 外部终止任务 */
  | "canceled" /* 任务内部自己取消了 */
  | "finished" /* 任务执行完成 */

type TaskCallbacks<T> = {
  // idle --> running
  started: () => void
  // running --> paused
  paused: () => void
  // paused --> running
  resumed: () => void
  // running/paused --> aborted
  aborted: () => void
  // running/paused --> canceled
  canceled: () => void
  // running/paused/canceled --> finished
  finished: (payload: { state: "success" | "failure"; value?: T; error?: any; taskRunSeconds: number }) => void
  finishedSuccess: (payload: { value: T; taskRunSeconds: number }) => void
  finishedFailure: (payload: { error: any; taskRunSeconds: number }) => void
}

const taskCenter = new Map<ID, Task<any>>()

/** 在任务中心中，查找某个任务 */
function findTask(taskID: ID): Task<any> | undefined {
  return taskCenter.get(taskID)
}

/**
 * 异步任务封装类（兼容于 Promise，但保持惰性，且可链式衔接， 并提供一些方便的管理接口）
 */
export class Task<T, P = any> {
  // 所处状态
  is: TaskLifeCycle

  // 如果有output，那么is一定是finished:success。
  resultValue?: T

  // 如果有error，那么is一定是finished:failure/aborted/canceled。
  error?: any

  // 由 catch 注入, void 表示不处理错误
  fallback?: (error: any) => T | Promise<T>

  // 同ID的任务。是协同的。也就是说，有一些。跨链条的任务。是使用同一个ID即可。因此，全局有个任务中心。
  taskID?: any

  // 任务执行时间（秒）
  costTime?: number

  // 尚未执行的任务（基于此状态派生，供状态变更时通知更新）// 只有上一个任务执行完毕且成功了才可以进行下一个任务。
  parentTasks?: Task<any>[]

  // 注册的回调
  registeredCallbacks?: Partial<Record<keyof TaskCallbacks<T>, AnyFn[]>>

  // Task 可以暂停，每次路过检查点，继续执行前，需要检查等待
  private canRunSignalManager = new StateSignalManager<boolean>(true)
  private async getCanRunSignal(): Promise<boolean> {
    if (this.canRunSignalManager.innerState === true) {
      return true
    } else {
      return await this.canRunSignalManager.getNextStateSignal()
    }
  }

  constructor(private readonly execFn: TaskInnerFunction<T, P>, inputState?: Partial<Task<T>>) {
    // 如果指定了初始配置就直接用
    if (inputState) {
      Object.assign(this, inputState)
    }
    // 生成一个唯一的任务ID
    this.taskID ??= Symbol()
    // 在任务中心中，注册当前任务
    taskCenter.set(this.taskID, this)
    this.is ??= "idle"
  }

  destroy(): void {
    if (this.taskID) {
      taskCenter.delete(this.taskID)
    }
  }

  /** 仅包装一个已知值（不做任何计算），语义上，of比from更明确 */
  static of<T>(value: TaskResult<T>): Task<T> {
    if (value instanceof Task) {
      return value
    } else {
      return new Task(() => value)
    }
  }

  /** 从函数/Promise/值“解释”为 Task；统一入口，语义上，from比of更灵活、更有表现力 */
  static from<T, P = any>(src: Taskable<T, P>): Task<T, P> {
    if (src instanceof Task) return src
    if (typeof src === "function") {
      return new Task(src as TaskInnerFunction<T, P>)
    }
    return new Task(() => src)
  }

  // 快速访问Task内部的状态
  get isIdle(): boolean {
    return this.is === "idle"
  }
  get isRunning(): boolean {
    return this.is === "running"
  }
  get isPaused(): boolean {
    return this.is === "paused"
  }
  get isFinished(): boolean {
    return this.is.startsWith("finished")
  }
  get isSucceeded(): boolean {
    return this.is === "finished" && this.resultValue !== undefined
  }
  get isFailed(): boolean {
    return this.is === "finished" && this.error !== undefined
  }
  get isAborted(): boolean {
    return this.is === "aborted"
  }
  get isCanceled(): boolean {
    return this.is === "canceled"
  }
  get isEnded(): boolean {
    return this.isAborted || this.isCanceled || this.isFinished
  }

  /** 启动某个Task，返回一个可等待的 Promise */
  private async runSelf(payload?: { prevTaskResult: P }): Promise<T> {
    // 标记已结束的任务不可再执行
    if (this.isAborted)
      return Promise.reject(new Error("Task already aborted. create a new task if you want to rerun it."))
    if (this.isCanceled)
      return Promise.reject(new Error("Task already canceled. create a new task if you want to rerun it."))
    if (this.isFinished)
      if (this.isSucceeded) {
        return Promise.resolve(this.resultValue!)
      } else {
        return Promise.reject(this.error!)
      }

    // 核心算法就一句话 this.execFn()
    const finalCore = (payload: { prevTaskValue: any }) => {
      const taskStartTime = globalThis.performance?.now?.()
      const result = Promise.resolve()
        .then(async () => {
          this.is = "running" // 标记task正在运行
          this.triggerCallback("started")
          try {
            const result = await this.execFn(payload.prevTaskValue)
            this.resultValue = result
            return result
          } catch (error) {
            this.error = error
            return Promise.reject(error)
          }
        })
        .finally(() => {
          this.costTime = globalThis.performance?.now?.() - taskStartTime
          this.is = "finished"
          this.triggerCallback("finished", {
            state: "success",
            value: this.resultValue,
            error: this.error,
            taskRunSeconds: this.costTime!,
          })
        })
        .then((result) => {
          this.triggerCallback("finishedSuccess", { value: result, taskRunSeconds: this.costTime! })
          return result
        })
        .catch((e) => {
          if (this.fallback) {
            return this.fallback(e)
          } else {
            return Promise.reject(e)
          }
        })
        .catch((error) => {
          this.triggerCallback("finishedFailure", { error: error, taskRunSeconds: this.costTime! })
          return Promise.reject(error)
        })

      return result
    }
    return await finalCore({ prevTaskValue: payload?.prevTaskResult })
  }

  /** 启动Task链条，返回一个可等待的 Promise */
  async run(payload?: { prevTaskResult?: P }): Promise<T> {
    let taskResult: any = payload?.prevTaskResult
    for (const parentTask of (this.parentTasks ?? []).concat(this)) {
      // TODO: 任务直接需要检查点，移交控制权
      await this.getCanRunSignal()
      taskResult = await parentTask.runSelf({ prevTaskResult: taskResult })
    }
    return taskResult
  }

  // 内部的工具
  private triggerCallback<LifeCycle extends keyof TaskCallbacks<T>>(
    lifeCycle: LifeCycle,
    ...payload: Parameters<TaskCallbacks<T>[LifeCycle]>
  ): void {
    this.registeredCallbacks?.[lifeCycle]?.forEach((callback) => callback(...payload))
  }

  on<LifeCycle extends keyof TaskCallbacks<T>>(lifeCycle: LifeCycle, callback: TaskCallbacks<T>[LifeCycle]): Task<T> {
    this.registeredCallbacks ??= {}
    this.registeredCallbacks[lifeCycle] ??= []
    this.registeredCallbacks[lifeCycle]?.push(callback)
    return this
  }

  /**
   * 链式衔接下一个 Task（flatMap/chain），假定为B
   * 注意，这里返回的是下一个Task-B，而不是当前Task-A。
   * 因为Task-A的执行结果是Task-B的输入，所以Task-A的执行结果需要绑定到Task-B的输入。
   */
  chain<V>(taskable: Taskable<V, T>): Task<V, T> {
    const newTask = Task.from<V, T>(taskable)
    newTask.parentTasks = (this.parentTasks ?? []).concat(this)
    return newTask
  }

  abort(): this {
    if (this.isAborted) return this
    assert(this.isIdle, "Task is not idle, cannot be aborted")
    this.is = "aborted"
    this.error = new Error("This task has been aborted and cannot be executed.")
    this.triggerCallback("aborted")
    return this
  }

  /** 暂停任务链条（可再执行）
   * 有些任务内部有断点，需要自最近一个断点打断，交出JS线程的控制权，等待下次resume
   */
  pause(): this {
    if (this.isPaused || this.isIdle) return this
    assert(this.isRunning, "Task is not running, cannot be paused")
    this.is = "paused"
    this.triggerCallback("paused")
    this.canRunSignalManager.changeState(false)
    return this
  }

  // /** 恢复任务链条（可再执行） */
  // resume(): void {
  //   // TODO
  // }

  // /** 获取任务链条(以便任务逐一拆解以后单独处理) */
  // getTaskChain(): Task<T, P>[] {
  //   return this.taskState.parentTasks.concat(this)
  // }

  // /** 设置默认值（如果任务失败，catch 的语义更明确的版本） */
  // default(defaultValue: T | Promise<T>): Task<T, P> {
  //   return this.catch(() => defaultValue)
  // }

  // /** 如果任务失败， 捕获错误 */
  // catch(fallbackFn: (error: any) => T | Promise<T>): Task<T, P> {
  //   this.taskState.fallback = fallbackFn
  //   return this
  // }
}

/* Guard函数 */
export function isTask<T>(obj: any): obj is Task<T> {
  return obj instanceof Task
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
  return new Task((prevTaskResult: any) => {
    const promises = tasks.map((task) => task.run({ prevTaskResult }))
    return Promise.all(promises)
  })
}

export function createTask<T>(fn: Taskable<T>): Task<T> {
  return Task.from(fn)
}
