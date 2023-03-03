import { AnyFn } from './typings/constants'

/**
 * @todo it's type intelligense is not very smart for parameters
 * @example
 * const add = (a: number, b: number) => a + b
 * const multi = (a: number) => 3 + a
 * const c = mergeFunction(add, multi) // (a: number, b: number) => {add(a, b); multi(a, b)}
 */
export function mergeFunction<T extends AnyFn>(...fns: [T]): (...params: Parameters<T>) => [ReturnType<T>]
export function mergeFunction<T extends AnyFn, U extends (...args: Parameters<T>) => any>(
  ...fns: [T, U]
): (...params: Parameters<T>) => [ReturnType<T>, ReturnType<U>]
export function mergeFunction<
  T extends AnyFn,
  U extends (...args: Parameters<T>) => any,
  V extends (...args: Parameters<T>) => any
>(...fns: [T, U, V]): (...params: Parameters<T>) => [ReturnType<T>, ReturnType<U>, ReturnType<V>]
export function mergeFunction<
  T extends AnyFn,
  U extends (...args: Parameters<T>) => any,
  V extends (...args: Parameters<T>) => any,
  W extends (...args: Parameters<T>) => any
>(...fns: [T, U, V, W]): (...params: Parameters<T>) => [ReturnType<T>, ReturnType<U>, ReturnType<V>, ReturnType<W>]
export function mergeFunction<T extends AnyFn>(...fns: T[]): (...params: Parameters<T>) => ReturnType<T>[]
export function mergeFunction<T extends AnyFn>(...fns: T[]): (...params: Parameters<T>) => ReturnType<T>[] {
  return (...params) => fns.map((fn) => fn?.(...params))
}
