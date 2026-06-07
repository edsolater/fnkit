import { AnyFn, DeMayArray, DeMayFn, MayArray, MayFn, MayParameter, arrify, isFunction } from ".."

/**
 * @example
 * flatWithFn([(a: number) => a ** a, 3], [3]) //=> [27, 3]
 */
export const flatWithFn = <T extends MayArray<MayFn<any>>>(
  wrapValue: T,
  params?: MayParameter<DeMayArray<T>>,
): DeMayFn<DeMayArray<T>>[] =>
  // @ts-expect-error
  arrify(wrapValue).map((mayFn) => shrinkToValue(mayFn, params))

/**
 * get value from input, if input is a function. it will ve invoked
 *
 * @param mayValue maybe a function that will return targetValue
 * @param params the parameters that will be passed in mayValue(if it's function)
 * @returns a pure value which can't be a function
 * @deprecated use {@link shrinkFn} instead
 */
export default function shrinkToValue<T>(mayValue: T, params?: MayParameters<T>): MayReturn<T> {
  return isFunction(mayValue) ? mayValue(...(params ?? [])) : mayValue as Exclude<T, AnyFn>
}
/**
 * get value from input, if input is a function. it will ve invoked
 * @deprecated 使用更符合直觉的 {@link result}
 *
 * @param mayValue maybe a function that will return targetValue
 * @param params the parameters that will be passed in mayValue(if it's function)
 * @returns a pure value which can't be a function
 */
export function shrinkFn<T>(mayValue: undefined, params?: MayParameters<T>): undefined
export function shrinkFn<T>(mayValue: T, params?: MayParameters<T>): MayReturn<T>
export function shrinkFn<T>(mayValue: T, params?: MayParameters<T>): MayReturn<T> {
  return isFunction(mayValue) ? mayValue(...(params ?? [])) : mayValue as Exclude<T, AnyFn>
}

export function result<T>(mayValue: undefined, ...params: MayParameters<T>): undefined
export function result<T>(mayValue: T, ...params: MayParameters<T>): MayReturn<T>
export function result<T>(mayValue: T, ...params: MayParameters<T>): MayReturn<T> {
  return isFunction(mayValue) ? mayValue(...params) : mayValue as Exclude<T, AnyFn>
}
type MayParameters<T> = Parameters<Extract<T, AnyFn>>
type MayReturn<T> = T extends AnyFn ? ReturnType<T> : T

