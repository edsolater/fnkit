export function pipeHandle<T, U>(v: T, fn1: (v: T) => U): U
export function pipeHandle<T, U, W>(v: T, fn1: (v: T) => U, fn2: (v: U) => W): W
export function pipeHandle<T, U, W, V>(v: T, fn1: (v: T) => U, fn2: (v: U) => W, fn3: (v: W) => V): V
export function pipeHandle<T, U, W, V, X>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X
): X
export function pipeHandle<T, U, W, V, X, Y>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X,
  fn5: (v: X) => Y
): Y
export function pipeHandle<T, U, W, V, X, Y, Z>(
  v: T,
  fn1: (v: T) => U,
  fn2: (v: U) => W,
  fn3: (v: W) => V,
  fn4: (v: V) => X,
  fn5: (v: X) => Y,
  fn6: (v: Y) => Z
): Z
export function pipeHandle<T>(v: T, ...fn: ((v: T) => T)[]): T
export function pipeHandle<T>(v: T, ...fn: ((v: T) => T)[]): T {
  return fn.reduce((value, fn) => fn(value), v)
}
