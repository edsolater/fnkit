/**
 * 一次可取消资源的生命周期句柄。
 */
export interface Subscription {
  /** 是否已经完成取消；取消逻辑抛出异常时也保持为 true。 */
  readonly closed: boolean

  /** 取消资源。重复调用不会再次执行取消逻辑。 */
  unsubscribe(): void
}

/**
 * 把资源的取消逻辑封装为幂等 Subscription。
 *
 * 执行取消逻辑前先关闭 Subscription，避免取消过程中的重入或异常导致重复清理。
 */
export function createSubscription(info: { onUnsubscribe(): void }): Subscription {
  const subscription = {
    closed: false,
    unsubscribe() {
      if (subscription.closed) return

      subscription.closed = true
      info.onUnsubscribe()
    },
  }

  return subscription
}
