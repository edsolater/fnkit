import { AnyFn } from "../typings"

export interface Subscription {
  unsubscribe(): void
}

export function createSubscription<F extends AnyFn | undefined>(info: { onUnsubscribe(): void }): Subscription {
  return { unsubscribe: info.onUnsubscribe }
}
