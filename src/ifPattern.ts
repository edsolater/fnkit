/**
 * 可组合的匹配模式类
 * Pattern matching class for type-safe pattern matching in TypeScript.
 *
 * 支持 and/or/not 链式组合
 * Supports composable patterns with and/or/not operations.
 *
 * @example 组合模式（composing patterns）
 * const pattern = startsWith('http').and(includes('github'))
 * pattern.test('https://github.com') // true
 */
export class Pattern<T> {
  /**
   * 核心匹配函数
   * The test function that determines if a value matches this pattern
   */
  public readonly matchRule!: (v: T) => boolean

  /**
   * 可选标签，用于调试和组合
   * Optional description of this pattern for debugging
   */
  public readonly label?: string

  constructor(matchRule: (v: T) => boolean, label?: string) {
    this.matchRule = matchRule
    this.label = label
  }

  /**
   * 创建Pattern实例（静态工厂方法）
   * Create a Pattern instance (static factory method)
   */
  static of<T>(matchRule: (v: T) => boolean, label?: string): Pattern<T> {
    return new Pattern(matchRule, label)
  }

  /**
   * 执行匹配测试
   * Test if a value matches this pattern
   */
  test(v: T): boolean {
    return this.matchRule(v)
  }

  /**
   * AND组合，返回新实例
   * Create a new pattern that matches if both this and other pattern match (AND logic)
   */
  and(other: Pattern<T>): Pattern<T> {
    return Pattern.of<T>(
      (v) => this.test(v) && other.test(v),
      this.label && other.label ? `(${this.label} AND ${other.label})` : undefined,
    )
  }

  /**
   * OR组合，返回新实例
   * Create a new pattern that matches if either this or other pattern matches (OR logic)
   */
  or(other: Pattern<T>): Pattern<T> {
    return Pattern.of<T>(
      (v) => this.test(v) || other.test(v),
      this.label && other.label ? `(${this.label} OR ${other.label})` : undefined,
    )
  }

  /**
   * NOT反转，返回新实例
   * Create a new pattern that matches if this pattern does NOT match (NOT logic)
   */
  not(): Pattern<T> {
    return Pattern.of<T>((v) => !this.test(v), this.label ? `NOT ${this.label}` : undefined)
  }
}

/**
 * 从函数创建自定义模式
 * Create a custom pattern from a predicate function
 *
 * @example 自定义断言（custom predicate）
 * const isEven = pred((n: number) => n % 2 === 0, 'isEven')
 * isEven.test(4) // true
 */
export const pred = <T>(fn: (v: T) => boolean, kind = "pred"): Pattern<T> => Pattern.of(fn, kind)

/**
 * 严格相等匹配
 * Pattern that matches a value using Object.is equality
 *
 * @example 严格相等（strict equality）
 * const isFive = eq(5)
 * isFive.test(5) // true
 * isFive.test('5') // false
 */
export const matchEq = <T>(x: T): Pattern<T> => Pattern.of((v) => Object.is(v, x), `eq(${String(x)})`)

/**
 * 多值匹配（任一相等）
 * Pattern that matches if value equals any of the provided values
 *
 * @example 多值匹配（one of values）
 * const isVowel = oneOf('a', 'e', 'i', 'o', 'u')
 * isVowel.test('a') // true
 * isVowel.test('b') // false
 */
export const oneOf = <T>(...xs: readonly T[]): Pattern<T> =>
  Pattern.of((v) => xs.some((x) => Object.is(v, x)), `oneOf(${xs.length} items)`)

/**
 * 正则表达式匹配
 * Pattern that matches strings against a regular expression
 *
 * @example 正则匹配（regex match）
 * const isUrl = re(/^https?:\/\//)
 * isUrl.test('https://example.com') // true
 */
export const re = (rx: RegExp): Pattern<string> => Pattern.of((s) => rx.test(s), `re(${rx})`)

/**
 * 字符串前缀匹配
 * Pattern that matches strings starting with a prefix
 *
 * @example 前缀匹配（prefix match）
 * const isHttps = startsWith('https')
 * isHttps.test('https://example.com') // true
 */
export const startsWith = (prefix: string): Pattern<string> =>
  Pattern.of((s) => s.startsWith(prefix), `startsWith("${prefix}")`)

/**
 * 字符串包含检测
 * Pattern that matches strings containing a substring
 *
 * @example 子串匹配（substring match）
 * const hasGithub = includes('github')
 * hasGithub.test('https://github.com') // true
 */
export const includes = (part: string): Pattern<string> => Pattern.of((s) => s.includes(part), `includes("${part}")`)

/**
 * 兜底模式（总是匹配）
 * Pattern that always matches - use as the last rule in ifPattern
 *
 * @example 兜底规则（fallback）
 * ifPattern(value, [
 *   [eq(1), () => 'one'],
 *   [otherwise(), () => 'other']
 * ])
 */
export const otherwise = (): Pattern<unknown> => Pattern.of(() => true, "otherwise")

/**
 * 模式匹配主函数
 * Pattern matching function inspired by functional programming languages.
 *
 * 顺序遍历，首个匹配即返回
 * Evaluates rules in order and returns the result of the first matching handler.
 *
 * 无匹配时抛出错误 (如不能覆盖全部可能的情况，使用{@link otherwise}兜底)
 * Throws an error if no pattern matches.
 *
 *
 * @param value - 待匹配的值 / The value to match against patterns
 * @param rules - 规则数组，格式为 [pattern, handler] /  Rules: Array of [pattern, handler] tuples
 *
 * ### 匹配规则:
 * 可以是一个值，也可以是模式，或者是返回布尔值的普通函数。
 * 模式由一些内部函数组成，如{@link re}, {@link startsWith}, {@link includes}等
 * 或者用户自定义的{@link pred}(返回一个pattern对象)。
 * @returns 匹配的handler执行结果 / The result of the first matching handler
 * @throws 无匹配时 / Error if no pattern matches
 *
 * @example 模式对象（pattern objects）
 * const result = ifPattern(input, [
 *   [re(/^https?:\/\//), () => 'url'],
 *   [startsWith('git:'), () => 'git'],
 *   [otherwise(), () => 'other']
 * ])
 *
 * @example 混合匹配（mixed matching）
 * const result = ifPattern(status, [
 *   [200, () => 'success'],
 *   [404, () => 'not found'],
 *   [oneOf(500, 502, 503), () => 'server error'],
 *   [otherwise(), (code) => `unknown: ${code}`]
 * ])
 *
 * @example 多模式组合（multi patterns）
 * const result = ifPattern(host, [
 *   [startsWith('http').and(includes('github')), () => 'github url'],
 *   [startsWith('http').and(includes('localhost').not()), () => 'remote http'],
 *   [otherwise(), () => 'other']
 * ])
 *
 * @example 普通函数（plain function）
 * const result = ifPattern(num, [
 *   [(n) => n > 10, () => 'big'],
 *   [(n) => n % 2 === 0, () => 'even'],
 *   [otherwise(), () => 'odd']
 * ])
 */
export function ifPattern<T, R>(
  value: T,
  rules: ReadonlyArray<readonly [Pattern<T> | ((v: T) => boolean) | T, (v: T) => R]>,
): R {
  for (const [pattern, handler] of rules) {
    const matched =
      pattern instanceof Pattern
        ? pattern.test(value)
        : typeof pattern === "function"
          ? (pattern as (v: T) => boolean)(value)
          : Object.is(value, pattern)

    if (matched) {
      return handler(value)
    }
  }

  throw new Error(`[ifPattern] No pattern matched for value: ${String(value)}`)
}
