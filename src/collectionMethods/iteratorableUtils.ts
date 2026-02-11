import { type Collection, type GetCollectionValue, type GetCollectionKey, assert } from ".."
import { getType, isArray, isIterable, isIterator, isMap, isObject, isSet } from "../dataType"

export type Iteratorable<E = any> = Iterable<E> | IterableIterator<E> | Iterator<E> | IteratorObject<E>
export function isIterableOrIterator(v: unknown): v is Iteratorable<any> {
  return isIterable(v) || isIterator(v)
}

/**
 * 将 Iterator/Iterable/IterableIterator 统一转为可使用 Iterator Helpers 的 Iterator
 * Convert Iterator/Iterable/IterableIterator to Iterator for using Iterator Helpers
 *
 * @param target - 迭代器或可迭代对象 / Iterator or Iterable
 * @returns Iterator 对象（可使用 .filter/.map 等） / Iterator object (can use .filter/.map etc.)
 *
 * @example Iterable 转 Iterator（Iterable to Iterator）
 * const iter = toIterable([1, 2, 3])
 * iter.filter(v => v > 1) // ✓ 可用 Iterator Helpers
 *
 * @example Iterator 直接返回（Iterator returns directly）
 * const iter = toIterable([1, 2, 3].values())
 * iter.map(v => v * 2) // ✓ 可用 Iterator Helpers
 */
export function toIterator<T>(target: Iterator<T> | Iterable<T> | IterableIterator<T>): IteratorObject<T> {
  assert(isIterableOrIterator(target), `toIterator: target is not iterable or iterator`)
  
  // 如果已经是 Iterator（有 next 方法），直接返回
  // If already Iterator (has next method), return directly
  if (isIterator(target)) {
    return target as IteratorObject<T>
  }
  
  // 如果是 Iterable（如 Array），获取其 Iterator
  // If Iterable (like Array), get its Iterator
  if (isIterable(target)) {
    return target[Symbol.iterator]() as IteratorObject<T>
  }
  
  throw new Error(`toIterator: unsupported target type: ${getType(target)}`)
}
