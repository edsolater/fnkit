import { AnyFn } from '.'

/**
 * solid params and return a new function
 * but, it will lost correct type
 * @example
 * const newFn = bindParams(connectWallet, [, config])
 * const v = newFn(wallet)
 * const sameAs = connectWallet(wallet, config)
 */
export function bindParams<T extends AnyFn>(fn: T, params: (Parameters<T>[number] | undefined)[]) {
  return ((...args: any[]) => {
    const newParams = [...args]
    Object.entries(params).forEach(([idx, v]) => {
      newParams[idx] = v
    })
    return fn(...newParams)
  }) as (...arg: Parameters<T>[number][]) => ReturnType<T>
}

type MakeItemsOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
function add(a: number, b: number, c: string) {
  return a + b
}
const fn = bindParams(add, [, , 'c'])
fn(1, 2)

type C = [qr: number, sdf: number, ehl: string]
