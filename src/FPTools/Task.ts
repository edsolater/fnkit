import { Result } from "./Result"

/* -----------------------------------------
 * Task：声明式任务容器
 * -----------------------------------------
 * 设计理念：
 *  - Task = Result + 语义封装；
 *  - Task 自身是可组合的，但 Result 是只读的；
 *  - 所有操作都返回新的 Task，而不是修改底层 Result。
 * ----------------------------------------- */

export class Task<T, E = unknown> {
  private readonly result: Result<T, E>

  private constructor(result: Result<T, E>) {
    this.result = result
  }

  /** 创建成功任务 */
  static of<T>(value: T): Task<T> {
    return new Task(Result.Ok(value))
  }

  /** 创建失败任务 */
  static fail<E>(error: E): Task<never, E> {
    return new Task(Result.Err(error))
  }

  /** 从函数中安全创建任务（自动捕获异常） */
  static from<T>(fn: () => T): Task<T> {
    try {
      return Task.of(fn())
    } catch (e) {
      return Task.fail(e)
    }
  }

  /** 只读访问底层 Result（不允许修改） */
  get value(): Result<T, E> {
    return this.result
  }

  /** 判断是否成功 */
  get isOk() {
    return this.result.isOk
  }

  /** 判断是否失败 */
  get isErr() {
    return this.result.isErr
  }

  /** 守卫：不满足条件即短路为失败 */
  guard(predicate: (v: T) => boolean, error: E): Task<T, E> {
    if (this.result.isErr) return this
    return predicate(this.result.unwrap())
      ? this
      : Task.fail(error)
  }

  /** 执行业务逻辑（只在成功时执行） */
  do<U>(fn: (v: T) => U): Task<U, E> {
    const next = this.result.andThen<U>(v => Result.Ok<U, E>(fn(v)))
    return new Task(next)
  }

  /** 链式连接下一个 Task */
  andThen<U>(fn: (v: T) => Task<U, E>): Task<U, E> {
    if (this.result.isErr) return this as unknown as Task<U, E>
    return fn(this.result.unwrap())
  }

  /** 出错时恢复为另一个 Task（容错） */
  orElse<F>(fn: (e: E) => Task<T, F>): Task<T, F> {
    if (this.result.isOk) return this as unknown as Task<T, F>
    return fn((this.result as any).inner.error)
  }

  /** 副作用：不改变结果 */
  tap(fn: (v: T) => void): this {
    if (this.result.isOk) fn(this.result.unwrap())
    return this
  }

  /** 最终取值（失败抛错） */
  unwrap(): T {
    return this.result.unwrap()
  }

  /** 最终取值（失败给默认） */
  unwrapOr(defaultValue: T): T {
    return this.result.unwrapOr(defaultValue)
  }

  /** 模式匹配 */
  match<R>(cases: { ok: (v: T) => R; err: (e: E) => R }): R {
    return this.result.match(cases)
  }
}
