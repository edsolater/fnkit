import { isFunction } from '../dataType'
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
export class LazyPromise<T = undefined> extends Promise<T> {
  #executor?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
  #innerPromise?: Promise<T>
  #loaded = false

  constructor(
    executor?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void,
    options?: {
      initLoad?: boolean
    }
  ) {
    super((resolve, reject) => {
      resolve(undefined as T) // not elegent, but works
    })
    this.#executor = executor
    if (options?.initLoad) this.load()
  }

  static resolve<T>(value?: T | PromiseLike<T> | (() => T | PromiseLike<T>)) {
    return new LazyPromise<T>(
      (resolve) => {
        resolve(shrinkToValue(value))
      },
      { initLoad: !isFunction(value) }
    )
  }

  /** by default, executor is not loaded. but manually call this will manually load promise
   * need #executor to be fullfilled
   */
  load() {
    this.#innerPromise = this.#executor ? new Promise(this.#executor) : Promise.resolve(undefined as T)
    this.#loaded = true
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    if (!this.#loaded) this.load()
    return this.#innerPromise!.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult> {
    if (!this.#loaded) this.load()
    return this.#innerPromise!.catch(onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    if (!this.#loaded) this.load()
    return this.#innerPromise!.finally(onfinally)
  }

  get [Symbol.toStringTag]() {
    return 'Lazy'
  }
}
