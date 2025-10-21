import { Result } from "./Result"

/**
 * Task<T, E> —— 声明式任务
 * 
 * 只用于表达业务语义，不额外持有状态。
 * 它的行为完全依托于 Result，但提供更自然的调用方式。
 */
export class Task<T, E = unknown> {
  constructor(public result: Result<T, E>) {}

  /** 成功任务 */
  static of<T>(value: T | Result<T, never>): Task<T> {
    return new Task(Result.Ok(value))
  }

  /** 失败任务 */
  static fail<E>(error: E | Result<never, E>): Task<never, E> {
    return new Task(Result.Err(error))
  }

  /** 自动捕获异常的安全执行 */
  static from<T>(fn: () => T): Task<T> {
    try {
      return Task.of(fn())
    } catch (err) {
      return Task.fail(err)
    }
  }

  get isOk(): boolean {
    return this.result.isOk
  }

  get isErr(): boolean {
    return this.result.isErr
  }

  /** 执行逻辑，仅在成功时执行 */
  map<U>(fn: (v: T) => U | Result<U, E>): Task<U, E> {
    this.result.map(fn as any)
    return this as unknown as Task<U, E>
  }

  /** 提供默认值或恢复逻辑 */
  default<F>(fn: (e: E) => T | Result<T, F>): Task<T, F> {
    this.result.default(fn as any)
    return this as unknown as Task<T, F>
  }

  /** 成功时执行副作用 */
  ifOk(effect: (v: T) => void): this {
    this.result.ifOk(effect)
    return this
  }

  /** 失败时执行副作用 */
  ifErr(effect: (e: E) => void): this {
    this.result.ifErr(effect)
    return this
  }

  /** 无论成功失败都执行副作用 */
  tap(effect: (state: { tag: "Ok" | "Err"; value: T | E }) => void): this {
    this.result.tap(effect)
    return this
  }

  /** 守卫：若条件不满足则转为 Err */
  guard(predicate: (v: T) => boolean, error: E): this {
    if (this.result.isOk && !predicate(this.result.value as T)) {
      this.result = Result.Err(error)
    }
    return this
  }

  /** 解包成功值（可选默认） */
  unwrap(orElse?: () => T): T | undefined {
    return this.result.unwrap(orElse!)
  }
}
