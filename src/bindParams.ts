import { AnyFn } from "."

/** will make every tuple item can support undefined,  */
type PartialAragument<T extends any[]> = {
  [K in keyof T]?: T[K] | undefined
}
/**
 * solid params and return a new function
 * but, it will lost correct type
 * @example
 * const newFn = bindParams(connectWallet, [, config])
 * const v = newFn(wallet)
 * const sameAs = connectWallet(wallet, config)
 */
export function bindParams<T extends AnyFn>(fn: T, params: PartialAragument<Parameters<T>>) {
  return (...args: any[]) => {
    const newParams = [...args]
    Object.entries(params).forEach(([idx, v]) => {
      newParams[idx] = v
    })
    return fn(...newParams)
  }
}
