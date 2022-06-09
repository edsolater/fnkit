import { Collection, flap, GetCollectionKey } from '.'
import { MayArray } from '..'
import { getEntryKey, toEntries } from './entries'
import filter from './filter'

/**
 * like typescript Omit
 * for collection that has key. (mainly object and map)
 * @requires {@link filter `filter()`} {@link flat `flat()`}
 * @example
 * console.log(omit({ a: 1, b: true }, ['a'])) //=> { b: true }
 */
export function omit<T extends Collection, U extends string>(
  collection: T,
  propNameList: MayArray<string>
): Partial<T>
export function omit<T extends Collection, U extends keyof T>(
  collection: T,
  propNameList: MayArray<U>
): Omit<T, U> {
  return filter(
    collection,
    (_value, key) => !flap(propNameList).includes(key as any)
  ) as unknown as Omit<T, U>
}

/**
 * like typescript Pick.
 *  for collection that has key. (mainly object and map)
 * @requires {@link filter `filter()`}
 * @example
 * pick({ a: 1, b: 2 }, ['a']) // { a: 1 }
 */
export function pick<T extends Collection, U extends keyof T>(
  collection: T,
  propNameList: U[]
): Pick<T, U> {
  return filter(collection, (_value, key) => propNameList.includes(key as any)) as unknown as Pick<
    T,
    U
  >
}

export function getKeys<T extends Collection>(collection: T): GetCollectionKey<T>[] {
  const entries = toEntries(collection)
  return entries.map((entry) => getEntryKey(entry))
}
