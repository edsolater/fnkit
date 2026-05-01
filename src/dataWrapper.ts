import { isFunction, isArray, isObject } from "./dataType"
import { DeMayFn, DeMayObj, MayFn, MayObj, MayObjKey } from "./typings/tools"
import { DeMayArray, MayArray } from "./mayArray"

/**
 * @example
 * wrapFn(3) //=> () => 3
 * wrapFn(() => 3) //=> () => 3
 */
export const wrapFn = <T extends MayFn<any>>(v: T): (() => DeMayFn<T>) => (isFunction(v) ? v : () => v) as any

/**
 * it has super version: flat
 * @example
 * @deprecated 语义不够明确，建议使用 {@link toArray}，其中to代表转换，统一toFunction, toArray, toObj等
 * wrapArr(3) //=> [3]
 * wrapArr([3]) //=> [3]
 */
export const wrapArr = <T extends MayArray<any>>(v: T): DeMayArray<T>[] => (isArray(v) ? v : [v]) as any

/**
 * @example
 * wrapObj(3, 'asdf') //=> { asdf: 3 }
 * wrapObj({ hello: 3 }, 'asdf') //=> { hello: 3 }
 */
export const wrapObj = <T extends MayObj<any>, P extends string>(
  v: T,
  keyName: P,
): Record<MayObjKey<T> | P, DeMayObj<T>> => (isObject(v) ? v : { [keyName ?? "defaultKey"]: v }) as any


/**
 * 转换成函数，如果已经是函数则不用转换
 */
export function toFunction<T extends MayFn<any>>(v: T): T extends MayFn<any> ? T : () => T {
  //@ts-ignore
  return isFunction(v) ? v : () => v
}
