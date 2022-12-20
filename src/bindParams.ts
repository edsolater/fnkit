import { AnyFn } from '.'

/**
 * solid params and return a new function
 * but, it will lost correct type
 */
export function bindParams<T extends AnyFn, Pa extends Partial<Parameters<T>> & unknown[]>(
  fn: T,
  params: [...Pa],
  thisArg: any = undefined
) {
  return fn.bind(thisArg, params) as (...arg: Partial<Parameters<T>> & unknown[]) => ReturnType<T>
}
