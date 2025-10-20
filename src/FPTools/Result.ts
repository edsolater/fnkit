/* -----------------------------------------
 * Result：Rust 风格的函数式结果类型
 * -----------------------------------------
 * 设计目的：
 *  - 以声明式、无控制流的方式表达“成功/失败”；
 *  - 代替 if / try / catch；
 *  - 提供 map / mapErr / andThen / orElse 等函数式组合；
 *  - 为上层 Task 提供底层语义支撑。
 *
 * Rust 原型：
 *  enum Result<T, E> { Ok(T), Err(E) }
 * ----------------------------------------- */
export type OkType<T> = { tag: "Ok"; value: T }
export type ErrType<E> = { tag: "Err"; error: E }
export type ResultType<T, E> = OkType<T> | ErrType<E>

export class Result<T, E = unknown> {
  private constructor(private readonly inner: ResultType<T, E>) {}

  static Ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>({ tag: "Ok", value })
  }

  static Err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>({ tag: "Err", error })
  }

  get isOk(): boolean {
    return this.inner.tag === "Ok"
  }
  get isErr(): boolean {
    return this.inner.tag === "Err"
  }

  unwrap(): T {
    if (this.inner.tag === "Ok") return this.inner.value
    throw this.inner.error
  }

  unwrapOr(defaultValue: T): T {
    return this.inner.tag === "Ok" ? this.inner.value : defaultValue
  }

  map<U>(fn: (v: T) => U): Result<U, E> {
    return this.inner.tag === "Ok" ? Result.Ok<U, E>(fn(this.inner.value)) : (this as unknown as Result<U, E>)
  }

  mapErr<F>(fn: (e: E) => F): Result<T, F> {
    return this.inner.tag === "Err" ? Result.Err<F, T>(fn(this.inner.error)) : (this as unknown as Result<T, F>)
  }

  andThen<U>(fn: (v: T) => Result<U, E>): Result<U, E> {
    return this.inner.tag === "Ok" ? fn(this.inner.value) : (this as unknown as Result<U, E>)
  }

  orElse<F>(fn: (e: E) => Result<T, F>): Result<T, F> {
    return this.inner.tag === "Err" ? fn(this.inner.error) : (this as unknown as Result<T, F>)
  }

  match<R>(cases: { ok: (v: T) => R; err: (e: E) => R }): R {
    return this.inner.tag === "Ok" ? cases.ok(this.inner.value) : cases.err(this.inner.error)
  }
}
