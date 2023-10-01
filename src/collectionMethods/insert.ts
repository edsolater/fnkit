import { isFunction, isNumber } from '../dataType'

/**
 * just like splice, but will not mutate original array
 *
 * ! // input number is treated as index
 * @param before old item | old item index | function
 * @param newItems new item
 * @returns new array
 * @example
 * console.log(insert(['hello', 'world'], 'hello', 'hi')) //=> ['hi', 'hello', 'world']
 * console.log(insert(['hello', 'world'], 0, 'hi')) //=> ['hi', 'hello', 'world']
 * console.log(insert([3, 4], 4, 55)) //=> [3, 4, 55] // input number is treated as index
 * console.log(insert([3, 4], 1, 55)) //=> [3, 55, 4]
 * console.log(insert([3, 4], (i) => i === 4, 55)) //=> [3, 55, 4] // use function
 */
export function insert<T extends ReadonlyArray<any>, V extends ReadonlyArray<any>>(
  arr: T,
  before: number | ((item: T[number], index: number, arr: T) => boolean) | T[number],
  ...newItems: V
): T & V {
  const newArray = [...arr]
  const index = isNumber(before)
    ? before
    : arr.findIndex((item, idx) => (isFunction(before) ? before(item, idx, arr) : item === before))
  newArray.splice(index, 0, ...newItems)
  //@ts-ignore
  return newArray
}

export function insertAfter<T extends ReadonlyArray<any>, V extends ReadonlyArray<any>>(
  arr: T,
  before: number | ((item: T[number], index: number, arr: T) => boolean) | T[number],
  ...newItems: V
): T & V {
  const newArray = [...arr]
  const index = isNumber(before)
    ? before
    : arr.findIndex((item, idx) => (isFunction(before) ? before(item, idx, arr) : item === before))
  newArray.splice(index + 1, 0, ...newItems)
  //@ts-ignore
  return newArray
}
