import { addS, divide, greaterThan, lessThan, toBigint, toNumber, toStringNumber } from '..'
import { reduce } from '../collectionMethods'
import { getType } from '../dataType'
import { Numberish } from '../numberish/types'

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
  return type === 'bigint'
    ? toBigint(result)
    : type === 'number'
    ? toNumber(result)
    : type === 'string'
    ? toStringNumber(result)
    : result
}
export function sum<T extends Numberish>(arr: readonly T[]): Unliteral<T> {
  const sumValue = reduce(arr, (acc, n) => addS(acc, n), '0')
  return toFistItemType(sumValue, arr)
}

export function average<T extends Numberish>(arr: readonly T[]): Unliteral<T> {
  const averageValue = divide(sum(arr), arr.length)
  return toFistItemType(averageValue, arr)
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
