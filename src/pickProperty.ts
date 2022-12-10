import { AnyObj } from './typings'

export function pickProperty<T extends AnyObj, P extends keyof T = keyof T>(property: P): (target: T) => T[P] {
  return (target) => target[property]
}
