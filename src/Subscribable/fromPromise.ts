import { type Subscribable, createSubscribable } from "./core"

export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue: T,
): Subscribable<T>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T,
): Subscribable<T | undefined>
export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T | undefined,
): Subscribable<T | undefined> {
  const subscribable = createSubscribable(defaultValue)
  promise.then((v) => subscribable.set(v))
  return subscribable
}
