// interface WeakerMap<K, V> extends Map<K, V> {
//   hello(): string
// }

import { map } from '../collectionMethods'
import { isObject } from '../dataType'

const weakMapCache = new WeakMap<object, WeakRef<any>>()
const createWrapperRef = <T extends object>(v: T): WeakRef<T> => {
  if (!weakMapCache.has(v)) {
    weakMapCache.set(v, new WeakRef(v))
  }
  return weakMapCache.get(v)!
}

const createWrapperRefIfNeeded = <T>(v: T) => (isObject(v) ? createWrapperRef(v) : v)
const derefWrapperRefIfNeeded = <T>(v: T) => (v instanceof WeakRef ? v.deref() : v)

/**
 * it wont prevent GC for both key and value , and weakMap can be traverse
 * for JS's GC rule, WeakerSet will usually be cleared  in next frame(depends on GC)
 * @todo test it!!!
 */
export class WeakerSet<T> extends Set<T> {
  private _innerValues: Set<T | WeakRef<T & object>>

  private cbCenter = {
    onAddNewItem: [] as ((item: T) => void)[]
  }

  constructor(iterable?: Iterable<T> | null) {
    super(iterable)
    this._innerValues = new Set()
    if (iterable) {
      for (const item of iterable) {
        this.add(item)
      }
    }
  }

  override add(item: T): this {
    this._innerValues.add(createWrapperRefIfNeeded(item))
    this.invokeAddNewItemCallbacks(item)
    return this
  }

  private *getRealItems(): IterableIterator<T> {
    for (const item of this._innerValues) {
      if (!item) continue
      const realValue = derefWrapperRefIfNeeded(item)
      if (!realValue) continue
      yield realValue
    }
  }

  override forEach(callback: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void {
    this._innerValues.forEach((v) => {
      if (!v) return
      const realValue = derefWrapperRefIfNeeded(v)
      if (!realValue) return

      callback.call(thisArg, realValue, realValue, this)
    }, thisArg)
  }

  map<U>(callback: (value: T) => U, thisArg?: any): WeakerSet<U> {
    const getRealSet = this.getRealItems.bind(this)
    const mappedIterable = function* () {
      for (const item of getRealSet()) {
        yield callback.call(thisArg, item)
      }
    }
    return new WeakerSet(mappedIterable())
  }

  filter(callback: (item: T) => any, thisArg?: any): WeakerSet<T> {
    const getRealSet = this.getRealItems.bind(this)
    const filteredIterable = function* () {
      for (const item of getRealSet()) {
        if (callback.call(thisArg, item)) {
          yield item
        }
      }
    }
    return new WeakerSet(filteredIterable())
  }
  // TODO other Array build-in tools

  private invokeAddNewItemCallbacks(item: T): void {
    this.cbCenter.onAddNewItem.forEach((cb) => cb?.(item))
  }

  onAddNewItem(callback: (item: T) => void): this {
    this.cbCenter.onAddNewItem.push(callback)
    return this
  }

  /** return a new instance  */
  clone(): WeakerSet<T> {
    const newItem = new WeakerSet<T>()
    newItem._innerValues = new Set(this._innerValues)
    newItem.cbCenter = { ...map(this.cbCenter, (cbs) => [...cbs]) }
    return newItem
  }

  override get size() {
    return new Set(this.getRealItems()).size
  }

  override delete(item: T): boolean {
    return this._innerValues.delete(createWrapperRefIfNeeded(item))
  }

  override clear(): void {
    return this._innerValues.clear()
  }

  override has(item: T): boolean {
    return new Set(this.getRealItems()).has(item)
  }

  override *keys(): IterableIterator<T> {
    yield* this.values()
  }

  override *values(): IterableIterator<T> {
    yield* this.getRealItems()
  }

  override *entries(): IterableIterator<[T, T]> {
    for (const item of this.getRealItems()) {
      if (item != null) {
        yield [item, item]
      } else {
        continue
      }
    }
  }

  override [Symbol.iterator]() {
    return this.values()
  }
}
