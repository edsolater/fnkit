import { AnyArr, AnyObj, isArray } from '../'

/**
 * simliar to `array.prototype.find()`
 * @requires  {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(find([1, 2], (v) => v > 1)) // 1
 * console.log(find({ a: 1, b: 2}, (v) => v > 1))) // 1
 */
export default function find<T extends AnyArr | undefined>(
  arr: T,
  predicate: (item: NonNullable<T>[number], index: number, arr: T) => boolean
): NonNullable<T>[number] | undefined
export default function find<O extends AnyObj | undefined>(
  collection: O,
  predicate: (value: O[keyof O], key: keyof O, obj: O) => boolean
): [key: keyof O, value: O[keyof O]] | undefined
export default function find(collection, predicate) {
  if (!collection) return
  return isArray(collection)
    ? collection.find(predicate)
    : findEntry(collection, ([k, v]) => predicate(v, k, collection))
}

export function findEntry<O extends AnyObj>(
  obj: O,
  predicate: (entry: [key: keyof O, value: O[keyof O]], obj: O) => boolean
): [key: O[keyof O], value: O[keyof O]] | undefined {
  return Object.entries(obj).find(([k, v]) => predicate([k, v], obj)) as
    | [key: O[keyof O], value: O[keyof O]]
    | undefined
}

export function findKey<O extends AnyObj>(
  obj: O,
  predicate: (key: keyof O, value: O[keyof O], obj: O) => boolean
): keyof O | undefined {
  return findEntry(obj, ([k, v], idx) => predicate(k, v, idx))?.[0]
}
