import { AnyFn } from './typings/constants';


export function changeFnReturnValue<T extends AnyFn, U>(
  fn: T,
  changer: (returnValue: ReturnType<T>) => U
): (...params: Parameters<T>) => U {
  return (...params) => changer(fn(...params));
}
