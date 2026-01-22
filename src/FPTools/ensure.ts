/**
 * **FP辅助函数，用于组合出更复杂的函数。**
 *
 * 不满足断言函数的值，使用fallbackValue的值
 *
 * 单纯看不如三元判断服务简洁。
 * 但表达力上，它ensure的是值，更不干扰
 * @example
 * const a = Math.random() > 0.5 ? 1 : NaN
 * ensure(a, (v) => v > 0, 0) // 1 | 0
 * ensure(a, (v) => v > 0) // 1 | undefined
 */

export function ensure<T, Fallback = T>(value: T, assertFn: (v: T) => boolean, fallbackValue?: Fallback): T | Fallback {
  return (assertFn(value) ? value : fallbackValue) as T | Fallback
}

