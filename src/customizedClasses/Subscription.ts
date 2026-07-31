/** 表示一次订阅的取消权；unsubscribe 可以重复调用，取消动作只执行一次。 */
export class Subscription {
  /** 这次订阅是否已经取消。unsubscribe 会更新它；业务代码可以看，但不要自己写。 */
  closed = false

  /** 真正解除订阅的动作；unsubscribe 保证它最多执行一次。 */
  #onUnsubscribe: (subscription: Subscription) => void

  /** 保存解除订阅的动作，等 unsubscribe 时再执行。 */
  constructor(options: {
    onUnsubscribe(subscription: Subscription): void
  }) {
    this.#onUnsubscribe = options.onUnsubscribe
  }

  /** 取消这次订阅；即使取消动作重入或抛错，之后也不会重复执行。 */
  unsubscribe = (): void => {
    if (this.closed) return

    this.closed = true
    this.#onUnsubscribe(this)
  }
}
