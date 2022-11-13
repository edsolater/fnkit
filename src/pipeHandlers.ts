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
