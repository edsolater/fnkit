import { count, type Collection } from ".."
import { toCollectionIterator } from "../collectionMethods/iteratorableUtils"

/**
 * 拼接多个可迭代对象为一个可迭代对象
 * @param iters
 * @returns
 */
export function concatIterables<T>(...iters: Iterable<T>[]): Iterable<T> {
  return {
    *[Symbol.iterator]() {
      for (const iter of iters) {
        yield* iter
      }
    },
  }
}

export function createEmptyIterable<T>(): Iterable<T> {
  return {
    *[Symbol.iterator]() {},
  }
}

export class DataStore<V = any, K = any> {
  size: number = 0
  entries: Iterable<[V, K]> = createEmptyIterable<[V, K]>()
  static from<U, W>(collectionable: Collection<U, W>): DataStore<U, W> {
    const collectionIterator = toCollectionIterator(collectionable)
    const emptyCollection = new DataStore<U, W>()
    emptyCollection.entries = collectionIterator as Iterable<[any, any]>
    emptyCollection.size = count(collectionable)
    return emptyCollection
  }
}
