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

export function insertAt<T>(arr: T[], at: number, ...items: T[]): T[] {
  return splice(arr, at, 0, ...items)
}

/**
 * it is like Python's build-in range
 * @param start start number
 * @param stop stop number
 * @param step (optional, default is 1) will affect output
 * @returns an array of number
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
 * @example
 * getFirstItem([2,3]) //=> 2
 */
export function getFirstItem<T>(arr: T[]): T | undefined {
  return arr[0]
}

/**
 * @example
 * getLastItem([2,3]) //=> 3
 */
export function getLastItem<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined
}

/**
 * 以${groupSize}为一组，进行分割
 * @param items 原数组
 * @param groupSize 分割的块的容量
 * @example
 * const splited = splitGroup(['aa', 'bb', 'cc'], 2) // [['aa','bb'], ['cc']]
 */
export function groupArrayBySize<T>(items: readonly T[], groupSize: number) {
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
 *
 * @param arr source
 * @param fromIndex delete start index
 * @param length delete length (default 1)
 */
export function removeItemByLength<T extends any[]>(arr: T, fromIndex: number, length = 1): T {
  const newArray = [...arr]
  newArray.splice(fromIndex, length)
  return newArray as T
}

/**
 * @param arr source
 * @param fromIndex delete start index
 * @param endIndex delete end index (default fromIndex + 1)
 * @returns
 */
export function removeItemByIndex<T extends any[]>(arr: T, fromIndex: number, endIndex = fromIndex + 1): T {
  const newArray = [...arr]
  newArray.splice(fromIndex, endIndex - fromIndex)
  return newArray as T
}

export function addItem<T, U>(arr: T[], ...items: U[]): (T | U)[]
export function addItem<T, U>(set: Set<T>, ...items: U[]): Set<T | U>
export function addItem(arr, ...items) {
  if (isArray(arr)) {
    return [...arr, ...items]
  }
  // Set
  if (isSet(arr)) {
    const newSet = new Set(arr)
    items.forEach((item) => newSet.add(item))
    return newSet
  }
}

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

/** toggle will auto unified items */
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
 *
 * @param arr original array
 * @param replaceTarget old item | old item index | function
 * @param newItem new item
 * @returns new array
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
 * use `Promise.allSettled`
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
 * use `Promise.all`
 */
export async function asyncMap<T, U>(
  arr: T[],
  mapFn: (item: T, index: number) => MayPromise<U>,
): Promise<Awaited<U>[]> {
  return Promise.all(arr.map(async (item, idx) => await mapFn(item, idx)))
}

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

/** type C = OmitItems<'a' | 'b' | 'c', 'a' | 'b' | 'd'> // 'c' */
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
