/**
 * @deprecated use {@link pipe}
 */
export function pipeHandlers<T, U>(v: T, fn1: (v: T) => U): U
export function pipeHandlers<T, U, W>(v: T, fn1: (v: T) => U, fn2: (v: U) => W): W
export function pipeHandlers<T, U, W, V>(v: T, fn1: (v: T) => U, fn2: (v: U) => W, fn3: (v: W) => V): V
export function pipeHandlers<T, U, W, V, X>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X
): X
export function pipeHandlers<T, U, W, V, X, Y>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X,
  fn5: (v: X) => Y
): Y
export function pipeHandlers<T, U, W, V, X, Y, Z>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X,
  fn5: (v: X) => Y,
  fn6: (v: Y) => Z
): Z
export function pipeHandlers<T>(v: T, ...fn: ((v: T) => T)[]): T
export function pipeHandlers<T>(v: T, ...fn: ((v: T) => T)[]): T {
  return fn.reduce((value, fn) => fn(value), v)
}

export function pipe<T>(v: T, ...fns: ((v: T) => T)[]): T
export function pipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
  v: T,
  ...fns: [
    (v: T) => M1,
    (v: M1) => M2,
    (v: M2) => M3,
    (v: M3) => M4,
    (v: M4) => M5,
    (v: M5) => M6,
    (v: M6) => M7,
    (v: M7) => M8,
    (v: M8) => M9,
    (v: M9) => M10,
    (v: M10) => R
  ]
): R
export function pipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9>(
  v: T,
  ...fns: [
    (v: T) => M1,
    (v: M1) => M2,
    (v: M2) => M3,
    (v: M3) => M4,
    (v: M4) => M5,
    (v: M5) => M6,
    (v: M6) => M7,
    (v: M7) => M8,
    (v: M8) => M9,
    (v: M9) => R
  ]
): R
export function pipe<T, R, M1, M2, M3, M4, M5, M6, M7, M8>(
  v: T,
  ...fns: [
    (v: T) => M1,
    (v: M1) => M2,
    (v: M2) => M3,
    (v: M3) => M4,
    (v: M4) => M5,
    (v: M5) => M6,
    (v: M6) => M7,
    (v: M7) => M8,
    (v: M8) => R
  ]
): R
export function pipe<T, R, M1, M2, M3, M4, M5, M6, M7>(
  v: T,
  ...fns: [
    (v: T) => M1,
    (v: M1) => M2,
    (v: M2) => M3,
    (v: M3) => M4,
    (v: M4) => M5,
    (v: M5) => M6,
    (v: M6) => M7,
    (v: M7) => R
  ]
): R
export function pipe<T, R, M1, M2, M3, M4, M5, M6>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => M6, (v: M6) => R]
): R
export function pipe<T, R, M1, M2, M3, M4, M5>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => R]
): R
export function pipe<T, R, M1, M2, M3, M4>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => R]
): R
export function pipe<T, R, M1, M2, M3>(v: T, ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => R]): R
export function pipe<T, R, M1, M2>(v: T, ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => R]): R
export function pipe<T, R, M1>(v: T, ...fns: [(v: T) => M1, (v: M1) => R]): R
export function pipe<T, R>(v: T, ...fns: [(v: T) => R]): R
export function pipe<T>(v: T): T
export function pipe<T>(v: T, ...fns: ((v: T) => T)[]): T {
  return fns.reduce((value, fn) => fn(value), v)
}
