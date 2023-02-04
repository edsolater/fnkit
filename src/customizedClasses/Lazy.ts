import { shrinkToValue } from '../wrapper'

/**
 * like promise, but
 * **only call  will make value calcuated.**
 * @example <caption>use like Promise</caption>
 * const a = LazyPromise.load(() => {
 *   console.log('1: ', 1) // load
 *   return LazyPromise.resolve(() => 2)
 * })
 * const b = await a
 * console.log('b: ', b) // load
 *
 * @example <caption>don't execute if not called</caption>
 * const c = LazyPromise.load(() => {
 *   console.log('3: ', 3) // not load
 *   return LazyPromise.resolve(() => 2)
 * })
 */
export class Lazy<T> implements Promise<T> {
  #executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    this.#executor = executor
  }

  static resolve<T>(value: T | PromiseLike<T> | (() => T | PromiseLike<T>)) {
    return new Lazy<T>((resolve) => {
      resolve(shrinkToValue(value))
    })
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return new Promise(this.#executor).then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult> {
    return new Promise(this.#executor).catch(onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return new Promise(this.#executor).finally(onfinally)
  }

  get [Symbol.toStringTag]() {
    return 'Lazy'
  }
}
