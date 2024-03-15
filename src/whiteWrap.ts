import { isFunction, isArray, isObject } from "./dataType"
import { DeMayArray, DeMayFn, DeMayObj, MayArray, MayFn, MayObj, MayObjKey } from "./typings/tools"

/**
 * @example
 * wrapFn(3) //=> () => 3
 * wrapFn(() => 3) //=> () => 3
 */
export const wrapFn = <T extends MayFn<any>>(v: T): (() => DeMayFn<T>) => (isFunction(v) ? v : () => v) as any

/**
 * it has super version: flat
 * @example
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
