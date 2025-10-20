/**
 * Option<T> 表示“可存在或缺席的值”。
 * - Some(value): 表示存在有效值。
 * - None: 表示不存在（对应 null / undefined）。
 *
 * Option 提供安全的链式操作，不需要显式判断空值。
 * 所有方法都保持纯函数语义，不会抛出异常。
 */
export class Option<T> {
  private constructor(private readonly value: T | null | undefined) {}

  /**
   * 宽容构造：接受任意值。
   * 如果传入 null 或 undefined，会自动创建 None。
   */
  static of<T>(value: T | null | undefined): Option<T> {
    return new Option(value == null ? undefined : value)
  }

  /**
   * 严格构造：保证值一定存在。
   * 若传入 null 或 undefined，将抛出错误。
   */
  static Some<T>(value: T | Option<T>): Option<NonNullable<T>> {
    if (value instanceof Option) {
      if (value.isNone()) throw new Error("Option.Some() can't accept `None`")
      return value as Option<NonNullable<T>>
    } else {
      if (value == null) throw new Error("Option.Some() can't accept `null` or `undefined`")
      return new Option(value)
    }
  }

  /**
   * 单例 None：表示缺席。
   */
  static None = new Option<never>(undefined)

  /** 判断是否存在值（非 null / undefined） */
  isSome(): boolean {
    return this.value != null
  }

  /** 判断是否为 None */
  isNone(): boolean {
    return !this.isSome()
  }

  /**
   * map() —— “存在时的变换”
   *
   * 若当前为 Some，则执行传入函数并将结果包裹为新的 Option。
   * 若函数返回的是 Option，则自动解包。
   * 若当前为 None，则直接返回 None。
   *
   * 语义：描述“若存在值，则将其映射到新值”。
   */
  map<U>(fn: (v: T) => U | Option<U>): Option<U> {
    if (this.isNone()) return Option.None
    const result = fn(this.value!)
    return result instanceof Option ? result : Option.of(result)
  }

  /**
   * default() —— “缺席时的替代”
   *
   * 若当前为 Some，则原样返回；
   * 若当前为 None，则执行 fn() 生成替代值，并自动包裹为 Option。
   *
   * 当 T 为 never/null/undefined 时，Option 为空，
   * 此时 default 的返回类型由 fn 的返回值决定；
   * 否则，返回 Option<T>。
   */
  default<U>(this: Option<never | null | undefined>, fn: () => U | Option<U>): Option<U>
  default(fn: () => T | Option<T>): Option<T>
  default<U>(fn: () => U | Option<U>): Option<T | U> {
    if (this.isSome()) return this as any
    const result = fn()
    return result instanceof Option ? result : Option.of(result)
  }

  /**
   * tap() —— “无论有无值，都执行副作用”
   *
   * 该函数用于执行副作用（如日志、调试、外部调用）。
   * 不会影响 Option 的结果。
   *
   * 语义：描述“在值流中观察，但不改变它”。
   */
  tap(effect: (v: T | null | undefined) => void): Option<T> {
    effect(this.value)
    return this
  }

  /** 将 Option 解包为普通值 */
  unwrap(): T | undefined
  unwrap(orElse: () => T): T
  unwrap(orElse?: () => T): T | undefined {
    if (this.isSome()) return this.value as T
    return orElse ? orElse() : undefined
  }
}

export function some<T>(value: T | Option<T>): Option<T> {
  if (value instanceof Option) {
    return value
  } else {
    return Option.Some(value)
  }
}

export const none = Option.None
