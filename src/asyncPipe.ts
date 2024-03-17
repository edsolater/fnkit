import { asyncPipeDo } from "./asyncPipeDo"
import type { MayPromise } from "./typings"

export function asyncPipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
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
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9>(
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
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8>(
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
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4, M5, M6, M7>(
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
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4, M5, M6>(
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<M6>,
    (v: M6) => MayPromise<R>,
  ]
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4, M5>(
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<M5>,
    (v: M5) => MayPromise<R>,
  ]
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3, M4>(
  ...fns: [
    (v: T) => MayPromise<M1>,
    (v: M1) => MayPromise<M2>,
    (v: M2) => MayPromise<M3>,
    (v: M3) => MayPromise<M4>,
    (v: M4) => MayPromise<R>,
  ]
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2, M3>(
  ...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<M2>, (v: M2) => MayPromise<M3>, (v: M3) => MayPromise<R>]
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1, M2>(
  ...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<M2>, (v: M2) => MayPromise<R>]
): (v: T) => Promise<R>
export function asyncPipe<T, R, M1>(...fns: [(v: T) => MayPromise<M1>, (v: M1) => MayPromise<R>]): (v: T) => Promise<R>
export function asyncPipe<T, R>(...fns: [(v: T) => MayPromise<R>]): (v: T) => Promise<R>
export function asyncPipe<T>(...fns: ((v: T) => MayPromise<T>)[]): (v: T) => Promise<T>
export function asyncPipe<T>(...fns: ((v: T) => MayPromise<T>)[]): (v: T) => Promise<T> {
  return (v: T) => asyncPipeDo(v, ...fns)
}
