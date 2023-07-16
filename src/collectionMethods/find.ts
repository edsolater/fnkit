import { AnyArr, AnyObj, isArray } from '../'

/**
 * simliar to `array.prototype.find()`
 * @requires  {@link toEntries `toEntries()`} {@link fromEntries `fromEntries()`} {@link getType `getType()`}
 * @example
 * console.log(find([1, 2], (v) => v > 1)) // 1
 * console.log(find({ a: 1, b: 2}, (v) => v > 1))) // 1
 */
export default function find<T>(arr: T[] | undefined, predicate: (item: T, index: number) => boolean): T | undefined
export default function find<T>(set: Set<T> | undefined, predicate: (item: T, index: number) => boolean): T | undefined
export default function find<S extends Map<any, any>>(
  set: S | undefined,
  predicate: (
    item: S extends Map<any, infer F> ? F : unknown,
    index: S extends Map<infer K, any> ? K : unknown
  ) => boolean
): (S extends Map<any, infer F> ? F : unknown) | undefined
export default function find<O extends Record<any, any>>(
  obj: O | undefined,
  predicate: (value: O[keyof O], key: keyof O) => boolean
): O[keyof O] | undefined
export default function find(collection: any, predicate: any) {
  if (!collection) return
  return isArray(collection)
    ? collection.find(predicate)
    : findEntry(collection, ([k, v]) => predicate(v, k, collection))?.[1]
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
