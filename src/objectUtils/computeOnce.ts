/**
 * OnceRef：一次性计算的引用
 * - 第一次读取 value：执行 fn() 并缓存返回值
 * - 后续读取 value：直接返回缓存
 * - 不关心返回值类型：可以是普通值，也可以是 Promise
 */
export type OnceRef<T> = {
  readonly value: T
}

/**
 * computeOnce：把一次性计算包装成一个“值引用”
 *
 * 设计哲学：
 * - 外界只读 value，不暴露 hasRun/reset/exec 等控制面
 * - 把“什么时候执行、执行几次”的复杂性完全封装起来
 *
 * ⚠️ 建议 fn 无参：因为这是“只缓存一次”的语义，参数会被天然忽略。
 */
export function computeOnce<T>(fn: () => T): OnceRef<T> {
  let hasValue = false
  let cached!: T

  return Object.freeze({
    get value(): T {
      if (!hasValue) {
        cached = fn()
        hasValue = true
      }
      return cached
    },
  })
}
