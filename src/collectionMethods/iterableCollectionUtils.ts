import { Entry, type Collection, type Keyof, type ValueOf } from ".."
import { isArray, isIterable, isMap, isObject, isSet } from "../dataType"
import { toIterator } from "./iteratorableUtils"

/** 
 * 任何形式的collection都可以转换成此**无损**的中间状态。
 * @example
 * toIterable([1, 2]) // [1, 2]
 * toIterable({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function toCollectionIterator<C extends Collection>(collection: C): IteratorObject<Entry<ValueOf<C>, Keyof<C>>> {
  if (isArray(collection)) {
    return toIterator(collection.values()).map((v, idx) => Entry.of(v, idx)) as any
  } else if (isSet(collection)) {
    return toIterator(collection.values()).map((v, idx) => Entry.of(v, idx)) as any
  } else if (isMap(collection)) {
    return toIterator(collection.entries()).map(([k, v]) => Entry.of(v, k)) as any
  } else if (isIterable(collection)) {
    return toIterator(collection as any).map((v, idx) => Entry.of(v, idx)) as any
  } else if (isObject(collection)) {
    return toIterator(Object.entries(collection)).map(([k, v]) => Entry.of(v, k)) as any
  } else {
    throw new Error(`toCollectionIterator: unsupported collection type: ${typeof collection}`)
  }
}
