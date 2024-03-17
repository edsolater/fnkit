import type { MayPromise } from "./typings"

export function asyncPipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<M7>,
    (v: M7) => MayPromise<M8>,
    (v: M8) => MayPromise<M9>,
    (v: M9) => MayPromise<M10>,
    (v: M10) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<M7>,
    (v: M7) => MayPromise<M8>,
    (v: M8) => MayPromise<M9>,
    (v: M9) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<M7>,
    (v: M7) => MayPromise<M8>,
    (v: M8) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4, M5, M6, M7>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<M7>,
    (v: M7) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4, M5, M6>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4, M5>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3, M4>(
  v: MayPromise<T>,
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<R>,
  ]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2, M3>(
  v: MayPromise<T>,
  ...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<M2>, (v: M2) => MayPromise<M3>, (v: M3) => MayPromise<R>]
): Promise<R>
export function asyncPipeDo<T, R, M1, M2>(
  v: MayPromise<T>,
  ...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<M2>, (v: M2) => MayPromise<R>]
): Promise<R>
export function asyncPipeDo<T, R, M1>(
  v: MayPromise<T>,
  ...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<R>]
): Promise<R>
export function asyncPipeDo<T, R>(v: MayPromise<T>, ...fns: [(v: T) => MayPromise<R>]): Promise<R>
export function asyncPipeDo<T>(v: MayPromise<T>, ...fns: ((v: T) => MayPromise<T>)[]): Promise<T>
export function asyncPipeDo<T>(v: MayPromise<T>, ...fns: ((v: T) => MayPromise<T>)[]): Promise<T> {
  return fns.reduce((acc, fn) => acc.then((acc) => fn(acc)), Promise.resolve(v) as Promise<any>)
}
