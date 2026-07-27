/**
 * ObjectProxy 领域把尚未完成的值表达为可递归读取、调用和等待的代理。
 * 本文件只负责代理协议及其 Promise 边界，不负责状态转换，也不负责业务对象或 class 的实例化。
 */
import { hasProperty } from "./compare"

/**
 * ObjectProxy 的身份协议 key。
 *
 * 使用 symbol 避免与真实业务对象的字符串 key 冲突；这个 key 只负责识别包装外壳，
 * 不参与真实数据的读取或解包。
 */
export const objectProxyBrand = Symbol("ObjectProxy.brand")

/**
 * ObjectProxy 内部原始 Promise 的协议 key。
 *
 * 这个 Promise 直接解析真实数据，不使用 `{ value }` 等中间包装。因此业务对象即使
 * 自己包含 `value`、`brand` 或 `promise` 字段，也不会被 ObjectProxy 错误解包。
 */
export const objectProxyValuePromise = Symbol("ObjectProxy.valuePromise")

/**
 * 取得 Promise、属性或调用结果最终解析出的值。
 */
type Resolved<Value> = Awaited<Value>

/**
 * ObjectProxy 包装外壳公开的基础协议。
 */
type ObjectProxyProtocol<Value> = {
  [objectProxyBrand]: true
  [objectProxyValuePromise]: Promise<Resolved<Value>>
}

/**
 * 将值公开的全部 key 递归映射为 ObjectProxy。
 *
 * 映射包含字符串、数字和 symbol key；赋值是否可靠由调用方根据 fire-and-forget
 * 契约自行判断，不使用 readonly 施加类型限制。
 */
type ObjectProxyGet<Value> = {
  [Key in keyof Value]: ObjectProxy<Value[Key]>
}

/**
 * 当值可以作为函数调用时，保留参数并代理调用结果。
 */
type ObjectProxyApply<Value> = Value extends (...args: infer Args) => infer Result
  ? (...args: Args) => ObjectProxy<Result>
  : unknown

/**
 * 一个可递归传播的对象代理。
 *
 * ObjectProxy 只是未来值的包装表达，不负责创建业务实例。即使当前值最终解析为 class，
 * 调用方也必须先取得真实 class，再使用正常的 `new` 完成实例化；ObjectProxy 本身不
 * 提供也不模拟构造能力。
 *
 * Proxy 必须使用对象作为运行时 target，但这个 target 只是承载 trap 的临时外壳。
 * 真实数据始终保存在 `[objectProxyValuePromise]` 对应的 Promise 中，不会被转换成带有
 * `value` 字段的包装对象。`await`、`then` 和 `toPromiseFromObjectProxy()` 最终取得
 * 的都是这份未经包装的真实数据。
 *
 * 等待代理会取得当前值；读取任意 key 会得到该值的 ObjectProxy；调用函数值也会
 * 得到调用结果的 ObjectProxy。因此整条读取与调用链始终使用同一种抽象，直到调用方
 * 通过 `await` 或 `toPromiseFromObjectProxy()` 取得真实结果。
 */
export type ObjectProxy<Value> = ObjectProxyProtocol<Value> &
  PromiseLike<Resolved<Value>> &
  ObjectProxyGet<Resolved<Value>> &
  ObjectProxyApply<Resolved<Value>>

/**
 * 为一个未来值创建可递归传播的对象代理。
 *
 * `get` 从当前值读取 key，并把新的 Promise 交给下一层代理；`apply` 解析 JavaScript
 * 提供的 `thisArgument` 后调用当前函数值；`then` 暴露当前 Promise 的解析能力；`has`
 * 同步公开代理外壳自身已经确定的协议 key，不尝试同步判断尚未解析的业务属性。
 * 每项产生值的操作都会继续进入同一个代理工厂。
 *
 * `set` 只提供底层的 fire-and-forget 透传：它同步返回成功，仅表示已经接受赋值请求，
 * 不表示真实 setter 已执行，也不保证随后读取能够观察到写入，异步错误同样无法从赋值
 * 表达式捕获。这是危险能力，调用方不应依赖；可靠写入必须先取得真实对象再显式执行。
 */
function createObjectProxy<Value>(promise: Promise<Value>): ObjectProxy<Value> {
  const tempCallableTarget = (): void => undefined

  return new Proxy(tempCallableTarget, {
    get(_target, key) {
      if (key === objectProxyBrand) return true
      if (key === objectProxyValuePromise) return promise
      if (key === "then") return promise.then.bind(promise)

      const nextPromise = promise.then((value) => {
        if (value === null || value === undefined) {
          throw new TypeError(`Cannot read ${String(key)} from ${String(value)}`)
        }

        return Reflect.get(Object(value), key, value)
      })
      return createObjectProxy(nextPromise)
    },
    has(_target, key) {
      return key === objectProxyBrand || key === objectProxyValuePromise || key === "then"
    },
    set(_target, key, nextValue) {
      void promise.then((value) => {
        if (value === null || value === undefined) {
          throw new TypeError(`Cannot set ${String(key)} on ${String(value)}`)
        }

        if (!Reflect.set(Object(value), key, nextValue, value)) {
          throw new TypeError(`Cannot set ${String(key)}`)
        }
      })

      return true
    },
    apply(_target, thisArgument, argumentsList) {
      const invocationPromise = Promise.all([promise, Promise.resolve(thisArgument)]).then(([value, receiver]) => {
        if (typeof value !== "function") {
          throw new TypeError("ObjectProxy value is not callable")
        }

        return Reflect.apply(value, receiver, argumentsList)
      })

      return createObjectProxy(invocationPromise)
    },
  }) as ObjectProxy<Value>
}

/**
 * 将一个未来对象转换成可递归传播的 ObjectProxy。
 *
 * 这个转换只建立未来对象的包装表达，不改变对象的业务身份，也不接管 class 的实例化。
 * 如果包装结果中取得了 class，应先 await 取得真实 class，再由调用方显式使用 `new`。
 *
 * 返回的代理可以立即读取 key 或调用函数，无需等待 Promise 先行完成；每项产生值的
 * 操作都会返回新的 ObjectProxy。源 Promise 的拒绝以及读取、调用期间发生的异常都会
 * 沿对应的代理链继续传播。
 */
export function toObjectProxy<Value extends object>(promise: Promise<Value>): ObjectProxy<Value> {
  return createObjectProxy(promise)
}

/**
 * 判断一个未知值是否实现 ObjectProxy 的 symbol 身份协议。
 *
 * 判断只识别包装外壳，不读取内部真实数据，也不会把拥有普通 `value`、`brand` 或
 * `promise` 字段的业务对象误认为 ObjectProxy。
 */
export function isObjectProxy(value: unknown): value is ObjectProxy<unknown> {
  return hasProperty(value, objectProxyBrand) && value[objectProxyBrand] === true
}

/**
 * 将 ObjectProxy 转换成解析当前真实值的原生 Promise。
 *
 * 转换直接读取 `[objectProxyValuePromise]` 协议，不检查业务对象的 `value` 等普通字段，
 * 也不增加额外数据包装；返回的 Promise 会解析已经自动展开的真实值。
 *
 * 该函数进入 fnkit 的扁平公开命名空间，因此函数名显式写出 ObjectProxy 来源，避免与其他领域的 Promise
 * 转换发生含义冲突。它是纯 JavaScript 协议读取，不依赖其他非原生设施。
 */
export function toPromiseFromObjectProxy<Value>(objectProxy: ObjectProxy<Value>): Promise<Awaited<Value>> {
  return objectProxy[objectProxyValuePromise]
}
