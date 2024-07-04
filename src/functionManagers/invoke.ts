import type { AnyFn } from "../typings"

const invokeCache = new WeakMap<object, any>()

type InvokeOptions = {
  /**
   * by default, the key is the function itself, but you can set it to any value, to make the function unique
   */
  objectkey?: object
  /**
   * if true, the result will be cached, means the function will be called only once in one JS
   */
  once?: boolean
}

/**for readibility, {@link invoke} will run function  */
export function invoke<F extends AnyFn>(fn: F, params?: Parameters<F>, options?: InvokeOptions): ReturnType<F> {
  const core = () => (params ? fn(...params) : fn())
  if (options?.once) {
    const key = options.objectkey ?? fn
    if (invokeCache.has(key)) return invokeCache.get(key)
    const returnedValue = core()
    invokeCache.set(key, returnedValue)
    return returnedValue
  } else {
    return core()
  }
}

/** for readibility, {@link createInvoker} will return a action function (function with zero params) */
export function createInvoker<F extends AnyFn>(
  fn: F,
  params?: Parameters<F>,
  options?: InvokeOptions,
): () => ReturnType<F> {
  return () => invoke(fn, params, options)
}
