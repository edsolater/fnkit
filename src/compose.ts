import { pipe } from './pipe'

export function compose<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
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
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4, M5, M6, M7, M8, M9>(
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
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4, M5, M6, M7, M8>(
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
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4, M5, M6, M7>(
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
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4, M5, M6>(
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => M6, (v: M6) => R]
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4, M5>(
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => M5, (v: M5) => R]
): (v: T) => R
export function compose<T, R, M1, M2, M3, M4>(
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => M4, (v: M4) => R]
): (v: T) => R
export function compose<T, R, M1, M2, M3>(
  ...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => M3, (v: M3) => R]
): (v: T) => R
export function compose<T, R, M1, M2>(...fns: [(v: T) => M1, (v: M1) => M2, (v: M2) => R]): (v: T) => R
export function compose<T, R, M1>(...fns: [(v: T) => M1, (v: M1) => R]): (v: T) => R
export function compose<T, R>(...fns: [(v: T) => R]): (v: T) => R
export function compose(...fns: []): () => void
export function compose<T>(...fns: ((v: T) => T)[]): (v: T) => T
export function compose<T>(...fns: ((v: T) => T)[]): (v: T) => T {
  return (v: T) => pipe(v, ...fns)
}
