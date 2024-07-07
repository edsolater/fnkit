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

/**
 * if it not an array, wrap it
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
