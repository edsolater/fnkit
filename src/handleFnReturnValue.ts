import { AnyFn } from './typings/constants'

/**
 * lazy calc fn return value
 * @example
 * handleFnReturnValue(connectWallet, (r, [wallet]) =>
 *   r.then(() => {
 *     assert(wallet.adapter.publicKey, 'Wallet connected failed')
 *     store.setConnected(true)
 *     store.setOwner(toPubString(wallet.adapter.publicKey))
 *     store.setCurrentWallet(wallet)
 *   })
 * )
 * @returns new function
 */
export function handleFnReturnValue<T extends AnyFn, U>(
  fn: T,
  changer: (returnValue: ReturnType<T>, params: Parameters<T>) => U
): (...params: Parameters<T>) => U {
  return (...params) => changer(fn(...params), params)
}
