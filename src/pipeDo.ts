export function pipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
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
    (v: M10) => R,
  ]
): R
export function pipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9>(
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
    (v: M9) => R,
  ]
): R
export function pipeDo<T, R, M1, M2, M3, M4, M5, M6, M7, M8>(
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
    (v: M8) => R,
  ]
): R
export function pipeDo<T, R, M1, M2, M3, M4, M5, M6, M7>(
  v: T,
  ...fns: [
    (v: T) => M1,
    (v: M1) => M2,
    (v: M2) => M3,
    (v: M3) => M4,
    (v: M4) => M5,
    (v: M5) => M6,
    (v: M6) => M7,
    (v: M7) => R,
  ]
): R
export function pipeDo<T, R, M1, M2, M3, M4, M5, M6>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => M6, (v: M6) => R]
): R
export function pipeDo<T, R, M1, M2, M3, M4, M5>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => R]
): R
export function pipeDo<T, R, M1, M2, M3, M4>(
  v: T,
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => R]
): R
export function pipeDo<T, R, M1, M2, M3>(v: T, ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => R]): R
export function pipeDo<T, R, M1, M2>(v: T, ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => R]): R
export function pipeDo<T, R, M1>(v: T, ...fns: [(v: T) => M1, (v: M1) => R]): R
export function pipeDo<T, R>(v: T, ...fns: [(v: T) => R]): R
export function pipeDo<T>(v: T): T
export function pipeDo<T>(v: T, ...fns: ((v: T) => T)[]): T
export function pipeDo<T>(v: T, ...fns: ((v: T) => T)[]): T {
  return fns.reduce((value, fn) => fn(value), v)
}
