import { isArray, isFunction, isNumber, isSet } from "./dataType"
import { MayPromise } from "./typings/tools"

/**
 * (纯函数)
 * 新创建一个有初始长度的数组，默认空值为undefined
 * @param length 数组长度
 * @param fill 空位置上的值，默认undefined
 * @example
 * createArray(3) => [undefined, undefined, undefined]
 * createArray(3, 'ha') => ['ha', 'ha', 'ha']
 * createArray(3, i => i) => [0, 1, 2]
 */
export function createArray<T = undefined>(length: number, fill?: T | ((idx: number) => T)): T[] {
  if (isFunction(fill)) {
    // @ts-ignore
    return Array.from({ length }, (i) => i).map((i) => fill(i)) // cb in Array.from may only invoke once, it may cause BUG
  } else {
    // @ts-ignore
    return Array.from({ length }, () => fill)
  }
}

/**
 * origin `splice` is mutable , not convience to use
 */
export function splice<T>(arr: T[], start: number, deleteCount: number, ...items: T[]): T[] {
  const newArr = [...arr]
  newArr.splice(start, deleteCount, ...items)
  return newArr
}

/**
 * Inserts items at a specific index in an array.
 * @param arr The array to insert items into.
 * @param at The index at which to insert the items.
 * @param items The items to insert.
 * @returns A new array with the items inserted at the specified index.
 */
export function insertAt<T>(arr: T[], at: number, ...items: T[]): T[] {
  return splice(arr, at, 0, ...items)
}

/**
 * Creates an array of numbers from start to stop (inclusive) with the specified step.
 * @param start The starting number.
 * @param stop The ending number.
 * @param step The step value (optional, default is 1).
 * @returns An array of numbers.
 * @example
 * createRange(1, 4) //=> [1, 2, 3, 4]
 * createRange(-1, 4, 3) //=> [-1, 2]
 */
export function createRange(start: number, stop: number, step = 1): number[] {
  return Array.from(
    {
      length: Math.floor((stop - start) / step) + 1,
    },
    (_, i) => start + i * step,
  )
}

/**
 * Splits an array into groups of a specified size.
 * @param items The original array.
 * @param groupSize The size of each group.
 * @returns An array of arrays, where each inner array represents a group of items.
 * @example
 * const splited = splitGroup(['aa', 'bb', 'cc'], 2) // [['aa','bb'], ['cc']]
 */
export function groupArrayBySize<T>(items: readonly T[], groupSize: number): T[][] {
  const result: T[][] = []
  let group: T[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    group.push(item)
    if (group.length === groupSize || i === items.length - 1) {
      result.push(group)
      group = []
    }
  }
  return result
}

/**
 * Removes an item or a range of items from an array by specifying the start index and length.
 * @param arr The source array.
 * @param fromIndex The start index of the items to remove.
 * @param length The number of items to remove (default is 1).
 * @returns A new array with the specified items removed.
 */
export function removeItemByLength<T extends any[]>(arr: T, fromIndex: number, length = 1): T {
  const newArray = [...arr]
  newArray.splice(fromIndex, length)
  return newArray as T
}

/**
 * Removes an item or a range of items from an array by specifying the start and end index.
 * @param arr The source array.
 * @param fromIndex The start index of the items to remove.
 * @param endIndex The end index of the items to remove (default is fromIndex + 1).
 * @returns A new array with the specified items removed.
 */
export function removeItemByIndex<T extends any[]>(arr: T, fromIndex: number, endIndex = fromIndex + 1): T {
  const newArray = [...arr]
  newArray.splice(fromIndex, endIndex - fromIndex)
  return newArray as T
}

/**
 * Removes specified items from an array or a set.
 * @param arr The source array or set.
 * @param items The items to remove.
 * @returns A new array or set with the specified items removed.
 */
export function removeItem<T>(arr: T[], ...items: T[]): T[]
export function removeItem<T>(set: Set<T>, ...items: T[]): Set<T>
export function removeItem(arr, ...items) {
  if (isArray(arr)) {
    return arr.filter((i) => !items.includes(i))
  }
  // Set
  if (isSet(arr)) {
    const newSet = new Set(arr)
    items.forEach((item) => newSet.delete(item))
    return newSet
  }
}

/**
 * Toggles the presence of items in an array or a set. If an item is already present, it will be removed; otherwise, it will be added.
 * @param arr The source array or set.
 * @param items The items to toggle.
 * @returns A new array or set with the toggled items.
 */
export function toggleSetItem<T>(arr: T[], ...items: T[]): T[]
export function toggleSetItem<T>(set: Set<T>, ...items: T[]): Set<T>
export function toggleSetItem(arr, ...items) {
  if (isArray(arr)) {
    const newSet = new Set(arr)
    items.forEach((item) => (newSet.has(item) ? newSet.delete(item) : newSet.add(item)))
    return Array.from(newSet)
  }
  // Set
  if (isSet(arr)) {
    const newSet = new Set(arr)
    items.forEach((item) => (newSet.has(item) ? newSet.delete(item) : newSet.add(item)))
    return newSet
  }
}

/**
 * Replaces an item or items in an array with a new item.
 * @param arr The original array.
 * @param replaceTarget The item or index of the item to replace, or a function that determines which items to replace.
 * @param newItem The new item to replace with.
 * @returns A new array with the specified item(s) replaced.
 * @example
 * console.log(replaceItem(['hello', 'world'], 'hello', 'hi')) //=> ['hi', 'world']
 * console.log(replaceItem(['hello', 'world'], 0, 'hi')) //=> ['hi', 'world']
 * console.log(replaceItem([3, 4], 4, 55)) //=> [3, 4] // input number is treated as index
 * console.log(replaceItem([3, 4], 1, 55)) //=> [3, 55]
 * console.log(replaceItem([3, 4], (_, idx) => idx === 1, 55)) //=> [3, 55] // use function
 */
export function replaceItem<T, U>(
  arr: readonly U[],
  replaceTarget: U | ((item: U, index: number) => boolean),
  newItem: T,
) {
  const index = isNumber(replaceTarget)
    ? replaceTarget
    : arr.findIndex((item, idx) => (isFunction(replaceTarget) ? replaceTarget(item, idx) : item === replaceTarget))
  if (index === -1 || index >= arr.length) return [...arr]
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)]
}

/**
 * Maps an array of items to a new array of items using an asynchronous mapping function. Uses `Promise.allSettled` to handle promises.
 * @param arr The array to map.
 * @param mapFn The mapping function that takes an item and its index as arguments and returns a promise.
 * @returns A promise that resolves to an array of mapped items.
 */
export async function asyncMapAllSettled<T, U>(
  arr: T[],
  mapFn: (item: T, index: number) => MayPromise<U>,
): Promise<(Awaited<U> | undefined)[]> {
  return await Promise.allSettled(arr.map(async (item, idx) => await mapFn(item, idx))).then(
    (
      promiseSettled, // extract from `promise.allSettled()`
    ) =>
      promiseSettled.map((promiseSettledItem) =>
        promiseSettledItem.status === "fulfilled" /* fulfilled is promise.allSettled  */
          ? promiseSettledItem.value
          : undefined,
      ),
  )
}

/**
 * Maps an array of items to a new array of items using an asynchronous mapping function. Uses `Promise.all` to handle promises.
 * @param arr The array to map.
 * @param mapFn The mapping function that takes an item and its index as arguments and returns a promise.
 * @returns A promise that resolves to an array of mapped items.
 */
export async function asyncMap<T, U>(
  arr: T[],
  mapFn: (item: T, index: number) => MayPromise<U>,
): Promise<Awaited<U>[]> {
  return Promise.all(arr.map(async (item, idx) => await mapFn(item, idx)))
}

/**
 * Reduces an array to a single value using an asynchronous reducer function. Uses `Promise.all` to handle promises.
 * @param arr The array to reduce.
 * @param callbackfn The reducer function that takes the previous value, current value, current index, and the array itself as arguments and returns a promise.
 * @param initialValue The initial value for the reducer (optional).
 * @returns A promise that resolves to the reduced value.
 */
export async function asyncReduce<T>(
  arr: T[],
  callbackfn: (previousValue: Awaited<T>, currentValue: Awaited<T>, currentIndex: number, array: T[]) => MayPromise<T>,
): Promise<Awaited<T>>
export async function asyncReduce<T>(
  arr: T[],
  callbackfn: (previousValue: Awaited<T>, currentValue: Awaited<T>, currentIndex: number, array: T[]) => MayPromise<T>,
  initialValue: MayPromise<T>,
): Promise<Awaited<T>>
export async function asyncReduce<T, U>(
  arr: T[],
  callbackfn: (previousValue: Awaited<U>, currentValue: Awaited<T>, currentIndex: number, array: T[]) => MayPromise<U>,
  initialValue: MayPromise<U>,
): Promise<Awaited<U>>
export async function asyncReduce(
  arr: any[],
  callbackfn: (previousValue, currentValue, currentIndex: number, array: any[]) => any,
  initialValue?: any,
) {
  return initialValue === undefined
    ? arr.reduce((acc, currentValue, currentIndex, array) =>
        Promise.resolve(acc).then(async (previousValue) =>
          callbackfn(await previousValue, await currentValue, currentIndex, array),
        ),
      )
    : arr.reduce(
        (acc, currentValue, currentIndex, array) =>
          acc.then(async (previousValue) => callbackfn(await previousValue, await currentValue, currentIndex, array)),
        Promise.resolve(initialValue),
      )
}

/**
 * Returns the type of an array with specified items omitted.
 * @example
 * type C = OmitItems<'a' | 'b' | 'c', 'a' | 'b' | 'd'> // 'c'
 */
export type OmitItem<
  OriginString extends keyof any,
  OmitString extends keyof any | undefined = undefined,
> = OriginString extends infer T ? (T extends OmitString ? never : T) : never

/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to omit from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 */
export function omitItems<T>(arr: T[], items: T | T[]): T[] {
  const omitSet = new Set(Array.isArray(items) ? items : [items])
  return arr.filter((item) => !omitSet.has(item))
}

/**
 * Shuffles the elements of an array.
 * @param arr The array to shuffle.
 * @returns A new array with the elements shuffled.
 */
export function shuffle<T>(arr: ReadonlyArray<T>): T[] {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}
