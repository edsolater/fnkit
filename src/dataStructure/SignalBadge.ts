// 类型自身用于描述逻辑
export type SignalBadge<T = any> = Promise<T>

/**
 * 创建一个信号承诺徽章。本质上就是Listen once的场景。
 * @param callback
 * @example
 *  const badge = createSignalBadge((resolve) => {
 *    setTimeout(() => {
 *      resolve("hello world")
 *    })
 *  })
 * badge.then((value) => {
 *    // 这里的value就是"hello world"
 *    console.log(value) // "hello world"
 * })
 * @returns
 */
export function createSignalBadge<T = any>(
  registerCallback: (resolve: (value?: T) => void) => void,
  rejectCallback?: (reject: (error?: any) => void) => void,
): SignalBadge<T> {
  const { promise: badge, resolve, reject } = Promise.withResolvers<T>()
  // @ts-ignore
  registerCallback(resolve)
  rejectCallback?.(reject)
  return badge
}
