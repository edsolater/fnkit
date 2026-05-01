import { isArray } from "./dataType"
import type { AnyArr, MayDeepArray } from "./typings"

export type MayArray<T> = T | Array<T>
/** flap */
export type DeMayArray<T> = T extends any[] ? T[number] : T

/** for {@link MayArray */
export function mayForEach<T>(may: T[] | T | undefined, cb: (v: T, idx: number) => void) {
  if (!may) return
  if (isArray(may)) {
    may.forEach(cb)
  } else {
    cb(may, 0)
  }
}

/** for {@link MayArray} */
export function mayMap<T, R>(may: T[] | T | undefined, cb: (v: T, idx: number) => R) {
  if (!may) return []
  if (isArray(may)) {
    return may.map(cb)
  } else {
    return [cb(may, 0)]
  }
}

/** 使得 {@link MayArray} 具有**可和并性** */
export function mergeMayArray<T>(...mays: MayArray<T>[]): MayArray<T> {
  if (mays.length <= 1) return mays[0]
  return mays.flat() as MayArray<T>
}

/**
 * 转换成数组，如果已经是数组则不用转换
 */
export function toArray<T>(v: MayArray<T>): T[] {
  return isArray(v) ? v : [v]
}

/**
 * if it not an array, wrap it
 * @deprecated 语义不够明确，建议使用 {@link toArray}，其中to
 */
export function arrify<T>(v: MayArray<T>): [T]
export function arrify<T>(v: T): T extends AnyArr ? T : [T]
export function arrify<T>(v: T): T extends AnyArr ? T : [T] {
  return (isArray(v) ? v : [v]) as T extends AnyArr ? T : [T]
}

/**
 * if it not an array, wrap it
 */
export function deepArrify<T>(v: MayDeepArray<T>): [T]
export function deepArrify<T>(v: T): T extends AnyArr ? T : [T]
export function deepArrify<T>(v: T): T extends AnyArr ? T : [T] {
  return (isArray(v) ? v.flat(Infinity) : [v]) as T extends AnyArr ? T : [T]
}
