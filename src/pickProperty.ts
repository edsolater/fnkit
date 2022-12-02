import { AnyObj } from './typings'

export function pickProperty<T extends AnyObj>(property: keyof T): (target: T) => T[keyof T] {
  return (target) => target[property]
}
