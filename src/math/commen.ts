import { addS, divide, greaterThan, lessThan, multiply, toBigint, toNumber, toStringNumber } from ".."
import { reduce } from "../collectionMethods"
import { getType } from "../dataType"
import { Numberish } from "../numberish/types"

type Unliteral<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T

function toFistItemType<T>(result: Numberish, orginArr: readonly T[]): Unliteral<T> {
  const type = getType(orginArr[0])
  // @ts-expect-error froce type judge. don't mind auto infer error
  return type === "bigint"
    ? toBigint(result)
    : type === "number"
    ? toNumber(result)
    : type === "string"
    ? toStringNumber(result)
    : result
}
export function sum<T extends Numberish>(arr: readonly T[]): Unliteral<T> {
  const sumValue = reduce(arr, (acc, n) => addS(acc, n), "0")
  return toFistItemType(sumValue, arr)
}

export function average<T extends Numberish>(
  arr: readonly T[],
  options?: { method?: "Arithmetic Mean" | "Geometric Mean" | "Harmonic Mean" }, // TODO: imply it !!
): Unliteral<T> {
  const averageValue = divide(sum(arr), arr.length)
  return toFistItemType(averageValue, arr)
}

/**
 * make every object properties to be average
 * 平均化所有Object的key
 */
export function getObjectAverage<T>(objs: T[]): T {
  const resultObj = {} as T
  for (const key in objs[0]) {
    //@ts-ignore
    resultObj[key] = average(objs.map((obj) => obj[key]))
  }
  return resultObj
}

/**
 * Geometric Mean
 * 几何平均
 * @param arr
 * @returns
 */
export function geometricMean<T extends number>(arr: readonly T[]): number {
  return Math.pow(
    reduce(arr, (acc, n) => acc * n, 1),
    1 / arr.length,
  )
}
export function harmonicMean<T extends number>(arr: readonly T[]): number {
  return arr.length / reduce(arr, (acc, n) => acc + 1 / n, 0)
}

export function max<T extends Numberish>(arr: readonly T[]): Unliteral<T> {
  let maxValue = arr[0]
  for (let i = 1; i < arr.length; i++) {
    const curr = arr[i]
    if (greaterThan(curr, maxValue)) {
      maxValue = curr
    }
  }
  return toFistItemType(maxValue, arr)
}

export function min<T extends Numberish>(arr: readonly T[]): Unliteral<T> {
  let minValue = arr[0]
  for (let i = 1; i < arr.length; i++) {
    const curr = arr[i]
    if (lessThan(curr, minValue)) {
      minValue = curr
    }
  }
  return toFistItemType(minValue, arr)
}
