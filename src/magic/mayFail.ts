import { MayFn, shrinkToValue, wrapePromise } from '..'

const defaultExpireTime = 200 //(ms)
const expireMessage = 'task is too long'

export type FailReason = { type: 'expire'; details: unknown } | { type: 'error'; details: unknown }

/**
 * ignore taskFn's result if expired, not stop it.
 *
 * if not provide fallbackValue, it may cause two kinds of reject promise: {@link FailReason `type:FailReason`}
 *
 * if provide fallbackValue, promise will always resolved
 *  @requires {@link shrinkToValue `shrinkToValue`}
 * @version 0.0.2
 * @example
 * ```ts
 * mayFail(async () => 1, { expireAfter: 100 }).then(console.log) // 1
 * mayFail(() => 1).then(console.log) // 1
 * mayFail(1, { expireAfter: 100 }).then(console.log) // 1
 * mayFail(Promise.resolve(1)).then(console.log) // 1
 *
 * // for test
 * const longTask = () =>
 *   new Promise((resolve) => {
 *     setTimeout(() => {
 *       resolve('task over')
 *     }, 300)
 *   })
 * // for test
 * const brokenShortTask = () =>
 *   new Promise((resolve, reject) => {
 *     setTimeout(() => {
 *       reject('task error')
 *     }, 10)
 *   })
 *
 * mayFail(longTask, { fallbackValue: 'fallback' }).then((fb) => console.log(fb)) // 'fallback'
 * mayFail(longTask, { expireAfter: 500 }).catch(console.log) // {reason: 'expire', details: 'task over'}
 *
 * mayFail(longTask).catch(console.log) // {reason: 'expire', details: 'task is too long'}
 * mayFail(brokenShortTask).catch(console.log) // {reason: 'error', details: 'task error'}
 *
 * // callback version
 * mayFail(longTask, {
 *   expireAfter: 100,
 *   onExpire() {
 *     console.log('too long') // too long
 *   }
 * })
 *
 * // callback version
 * mayFail(brokenShortTask, {
 *   onError(err) {
 *     console.log('fail', err) // fail task error
 *   }
 * })
 * ```
 *
 * FAQ: 💡*should we add option:retry?*
 *
 * NO, this may be tedious for {@link mayFail}, just use catch chain, see below 👇
 *
 * @example
 * ```ts
 * // for test
 * const longTask = () =>
 *   new Promise((resolve) => {
 *     console.log(2) // 2 2 2 (try 3 times)
 *     setTimeout(() => {
 *       resolve('task over')
 *     }, 300)
 *   })
 * const startTime = Date.now()
 * mayFail(longTask)
 *   .catch(() => mayFail(longTask))
 *   .catch(() => mayFail(longTask))
 *   .catch(
 *     ({ type, details }) =>
 *       console.log(`${type}: ${details}`, console.log('duration', Date.now() - startTime)) // expire: task is too long, duration: 611
 *   )
 * ```
 */
export default function mayFail<T>(
  taskFn: MayFn<Promise<T> | T | PromiseLike<T>>,
  options: {
    /** @default 200ms */
    expireAfter?: number
    /**
     * both expire or error will return this
     * will cause mayFail never rejected ( but `onExpire` or `onError` will be called anyway)
     */
    fallbackValue?: T
    /** task is too long */
    onExpire?(): void
    /** task has throw error */
    onError?(err: unknown): void
  } = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      options.onExpire?.()
      options.fallbackValue != null
        ? resolve(options.fallbackValue)
        : reject({ type: 'expire', details: expireMessage })
    }, options.expireAfter ?? defaultExpireTime)
    const result = shrinkToValue(taskFn) as T | Promise<T> | PromiseLike<T>
    const promisedResult = wrapePromise(result)
    promisedResult
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        options.onError?.(error)
        options.fallbackValue != null
          ? resolve(options.fallbackValue)
          : reject({ type: 'error', details: error })
      })
  })
}
