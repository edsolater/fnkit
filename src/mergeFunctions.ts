import { AnyFn } from "./typings/constants"

/**
 * @todo it's type intelligense is not very smart for parameters
 * @example
 * const add = (a: number, b: number) => a + b
 * const multi = (a: number) => 3 + a
 * const c = mergeFunction(add, multi) // (a: number, b: number) => {add(a, b); multi(a, b)}
 */
export function mergeFunction<T extends AnyFn | undefined>(
  ...fns: [T]
): (...params: Parameters<T & AnyFn>) => [ReturnType<T & AnyFn>]
export function mergeFunction<
  T extends AnyFn | undefined,
  U extends ((...args: Parameters<T & AnyFn>) => any) | undefined,
>(...fns: [T, U]): (...params: Parameters<T & AnyFn>) => [ReturnType<T & AnyFn>, ReturnType<U & AnyFn>]
export function mergeFunction<
  T extends AnyFn | undefined,
  U extends ((...args: Parameters<T & AnyFn>) => any) | undefined,
  V extends ((...args: Parameters<U & AnyFn>) => any) | undefined,
>(
  ...fns: [T, U, V]
): (...params: Parameters<T & AnyFn>) => [ReturnType<T & AnyFn>, ReturnType<U & AnyFn>, ReturnType<V & AnyFn>]
export function mergeFunction<
  T extends AnyFn | undefined,
  U extends ((...args: Parameters<T & AnyFn>) => any) | undefined,
  V extends ((...args: Parameters<U & AnyFn>) => any) | undefined,
  W extends ((...args: Parameters<V & AnyFn>) => any) | undefined,
>(
  ...fns: [T, U, V, W]
): (
  ...params: Parameters<T & AnyFn>
) => [ReturnType<T & AnyFn>, ReturnType<U & AnyFn>, ReturnType<V & AnyFn>, ReturnType<W & AnyFn>]
export function mergeFunction<T extends AnyFn | undefined>(
  ...fns: T[]
): (...params: Parameters<T & AnyFn>) => ReturnType<T & AnyFn>[]
export function mergeFunction<T extends AnyFn | undefined>(
  ...fns: T[]
): (...params: Parameters<T & AnyFn>) => ReturnType<T & AnyFn>[] {
  return (...params) => fns.map((fn) => fn?.(...params))
}
