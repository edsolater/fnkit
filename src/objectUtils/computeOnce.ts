import { isObject } from ".."

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
 * ControlledOnceRef：受控一次性计算的引用
 * - 读取 value 不会触发计算
 * - 未执行前 value 为 undefined
 * Controlled once-computed value reference
 * - Reading value does not trigger execution
 * - value is undefined before execution
 */
export type ControlledOnceRef<T> = {
  readonly value: T | undefined
}

/**
 * OnceController：一次性计算控制器
 * One-time computation controller
 */
export type OnceController<T> = {
  readonly computed: boolean
  readonly value: T
  runEffectIfNeeded(): T
}

/**
 * 手动computeOnce
 * 读取value也不会自动执行， 除非显示地调用其runEffect方法。 适合需要更细粒度控制的场景。
 */
export function computeOnceManually<T>(fn: () => T, init?: any): OnceController<T> {
  let computed = false
  let value: T = init as T

  const innerState: OnceController<T> = {
    get computed() {
      return computed
    },
    get value() {
      return value
    },
    runEffectIfNeeded(): T {
      if (!computed) {
        const finalObject = fn()
        computed = true
        if (isObject(finalObject) && isObject(value)) {
          // 如果都是对象， 那么就保留 cached 的引用， 只更新它的内容。 这样外界持有的引用就不会失效了。
          const finalPrototype = Reflect.getPrototypeOf(finalObject)
          const finalDescriptors = Object.getOwnPropertyDescriptors(finalObject)

          Reflect.setPrototypeOf(value, finalPrototype)
          Object.defineProperties(value, finalDescriptors)

          if (!Object.isExtensible(finalObject)) {
            Reflect.preventExtensions(value)
          }
        } else {
          value = finalObject
        }
      }
      return value
    },
  }

  return innerState
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
  const controller = computeOnceManually(fn)

  return {
    get value(): T {
      controller.runEffectIfNeeded()
      return controller.value as T
    },
  }
}
