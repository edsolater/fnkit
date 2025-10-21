/**
 * Result<T, E> —— 表示一次可能成功或失败的计算。
 *  - Ok(value): 成功状态
 *  - Err(value): 失败状态
 *
 * 所有操作保持纯函数语义，异常自动捕获为 Err。
 * TODO: onOk/onErr/onChange 回调函数
 * 注意： 
 *    - Result是有状态的，适合表达业务逻辑
 *    - 而Option是无状态的，适合组合底层Utils
 */
export class Result<T, E = unknown> {
  private constructor(public tag: "Ok" | "Err", public value: T | E) {}

  static Ok<T, E = never>(value: T | Result<T, E>): Result<T, E> {
    if (value instanceof Result) {
      if (value.isErr) throw new Error("Result.Ok() can't accept `result::Err`")
      return value as Result<T, E>
    } else {
      return new Result<T, E>("Ok", value)
    }
  }

  static Err<E, T = never>(error: E | Result<T, E>): Result<T, E> {
    if (error instanceof Result) {
      if (error.isOk) throw new Error("Result.Err() can't accept `result::Ok`")
      return error as Result<T, E>
    } else {
      return new Result<T, E>("Err", error)
    }
  }

  get isOk(): boolean {
    return this.tag === "Ok"
  }
  get isErr(): boolean {
    return this.tag === "Err"
  }

  /** 成功时映射值，若出错自动转为 Err */
  map(fn: (v: T) => T | Result<T, E>): this {
    if (this.isErr) return this
    try {
      const r = fn(this.value as T)
      if (r instanceof Result) {
        this.tag = r.tag
        this.value = r.value
      } else {
        this.value = r
      }
    } catch (err) {
      this.tag = "Err"
      this.value = err as E
    }
    return this
  }

  /** 失败时提供默认值或替代 Result */
  default<U>(fn: (e: E) => U | Result<T, U>): Result<T, U> {
    if (this.isOk) return this as any
    try {
      const r = fn(this.value as E)
      if (r instanceof Result) {
        this.tag = r.tag
        this.value = r.value as any
      } else {
        this.tag = "Ok"
        this.value = r as any
      }
    } catch (err) {
      this.tag = "Err"
      this.value = err as E
    }
    return this as unknown as Result<T, U>
  }

  /** 当成功时执行副作用，不改变状态 */
  ifOk(effect: (v: T) => void): Result<T, E> {
    if (this.isOk) this.tap(({ value }) => effect(value as T))
    return this
  }

  /** 当失败时执行副作用，不改变状态 */
  ifErr(effect: (e: E) => void): Result<T, E> {
    if (this.isErr) this.tap(({ value }) => effect(value as E))
    return this
  }

  /** 无论成功失败，都会触发 (执行副作用) */
  tap(effect: (state: { tag: "Ok" | "Err"; value: T | E }) => void): Result<T, E> {
    effect({ tag: this.tag, value: this.value })
    return this
  }

  /** 解包成功值（失败使用默认值或函数） */
  unwrap(): T | undefined
  unwrap(orElse: () => T): T
  unwrap(orElse?: () => T): T | undefined {
    if (this.isOk) return this.value as T
    return orElse ? orElse() : undefined
  }
}

/**
 * 快捷方式， 等同于 {@link Result.Ok}
 */
export const ok = Result.Ok

/**
 * 快捷方式， 等同于 {@link Result.Err}
 */
export const err = Result.Err
