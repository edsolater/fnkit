import { AnyObj, isArray } from '..'
import { AnyArr } from '../typings'

export function forEach<T extends AnyArr>(
  collection: T,
  predicate: (item: T[number], index: number, arr: T) => void
): void
export function forEach<O extends AnyObj>(
  collection: O,
  predicate: (value: O[keyof O], key: keyof O, obj: O) => void
): void
export function forEach(collection, predicate) {
  return isArray(collection) ? collection.forEach(predicate) : forEachEntry(collection, ([k, v]) => predicate(v, k))
}

export function forEachEntry<O extends AnyObj>(
  collection: O,
  predicate: (entry: [key: keyof O, value: O[keyof O]], obj: O) => void
): void {
  Object.entries(collection).forEach(([k, v]) => predicate([k, v], collection))
}

export function forEachKey<O extends AnyObj>(
  collection: O,
  predicate: (key: keyof O, value: O[keyof O], obj: O) => void
): void {
  forEachEntry(collection, ([k, v], obj) => predicate(k, v, obj))
}
