import { AnyFn } from "./typings/constants"

/**
 * lazy calc fn return value
 * change function without invoke it
 * @example
 * changeFnReturnValue(connectWallet, (r, [wallet]) =>
 *   r.then(() => {
 *     assert(wallet.adapter.publicKey, 'Wallet connected failed')
 *     store.setConnected(true)
 *     store.setOwner(toPubString(wallet.adapter.publicKey))
 *     store.setCurrentWallet(wallet)
 *   })
 * )
 * @returns new function
 */
export function pipeFns<F extends AnyFn>(fn: F): F
export function pipeFns<F extends AnyFn, U>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
): (...params: Parameters<F>) => U
export function pipeFns<F extends AnyFn, U, W>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
  changer2: (returnValue: U) => W,
): (...params: Parameters<F>) => W
export function pipeFns<F extends AnyFn, U, W, X>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
  changer2: (returnValue: U) => W,
  changer3: (returnValue: W) => X,
): (...params: Parameters<F>) => X
export function pipeFns<F extends AnyFn, U, W, X, Y>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
  changer2: (returnValue: U) => W,
  changer3: (returnValue: W) => X,
  changer4: (returnValue: X) => Y,
): (...params: Parameters<F>) => Y
export function pipeFns<F extends AnyFn, U, W, X, Y, Z>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
  changer2: (returnValue: U) => W,
  changer3: (returnValue: W) => X,
  changer4: (returnValue: X) => Y,
  changer5: (returnValue: Y) => Z,
): (...params: Parameters<F>) => Z
export function pipeFns<F extends AnyFn, U, W, X, Y, Z, A>(
  fn: F,
  changer1: (returnValue: ReturnType<F>) => U,
  changer2: (returnValue: U) => W,
  changer3: (returnValue: W) => X,
  changer4: (returnValue: X) => Y,
  changer5: (returnValue: Y) => Z,
  changer6: (returnValue: Z) => A,
): (...params: Parameters<F>) => A

export function pipeFns<F extends AnyFn, U>(
  fn: F,
  ...changers: ((returnValue: ReturnType<F>) => U)[]
): (...params: Parameters<F>) => U
export function pipeFns<F extends AnyFn>(
  fn: F,
  ...changers: ((returnValue: ReturnType<F>) => any)[]
): (...params: Parameters<F>) => any
export function pipeFns<F extends AnyFn, U>(
  fn: F,
  ...changers: ((returnValue: ReturnType<F>) => any)[]
): (...params: Parameters<F>) => any {
  return function concatedFn(...params: Parameters<F>) {
    return changers.reduce((acc, changer) => changer(acc), fn(...params))
  }
}
