// interface WeakerMap<K, V> extends Map<K, V> {
//   hello(): string
// }

import { isObject } from '../dataType'

const createWrapperRef = <T extends object>(v: T) => new WeakRef(v)
const createWrapperRefIfNeeded = <T>(v: T) => (isObject(v) ? createWrapperRef(v) : v)
const derefWrapperRefIfNeeded = <T>(v: T) => (v instanceof WeakRef ? v.deref() : v)

/** it wont prevent GC for both key and value , and weakMap can be traverse
 * @todo test it!!!
 */
export class WeakerMap<K, V> extends Map<K, V> {
  private objectKeyMap: WeakMap<K & object, WeakRef<K & object>>
  // could find by value
  private reverseObjectKeyMap: WeakMap<WeakRef<K & object>, K & object>
  private innerStoreMap: Map<K | WeakRef<K & object>, V | WeakRef<V & object>>

  constructor()
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries)
    this.reverseObjectKeyMap = new WeakMap()
    this.objectKeyMap = new WeakMap()
    this.innerStoreMap = new Map()
    entries?.forEach(([k, v]) => this.set(k, v))
  }

  private getInnerKey(key: K) {
    if (isObject(key)) {
      if (!this.objectKeyMap.has(key)) {
        const refedValue = createWrapperRef(key)
        this.objectKeyMap.set(key, refedValue)
        this.reverseObjectKeyMap.set(refedValue, key)
      }
      return this.objectKeyMap.get(key)!
    } else {
      return key
    }
  }

  override set(key: K, value: V): this {
    const innerKey = this.getInnerKey(key)
    this.innerStoreMap.set(innerKey, createWrapperRefIfNeeded(value))
    return this
  }

  override get(key: K): V | undefined {
    const innerKey = this.getInnerKey(key)
    return derefWrapperRefIfNeeded(this.innerStoreMap.get(innerKey))
  }

  override forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    const stillValidMap = new Map(
      [...this.innerStoreMap.entries()].map(([innerKey, refValue]) => [
        derefWrapperRefIfNeeded(innerKey),
        derefWrapperRefIfNeeded(refValue)
      ]) as unknown as Map<K, V>
    )
    stillValidMap.forEach(callbackfn, thisArg)
  }

  override get size() {
    const stillValidMap = new Map(
      [...this.innerStoreMap.entries()].map(([innerKey, refValue]) => [
        derefWrapperRefIfNeeded(innerKey),
        derefWrapperRefIfNeeded(refValue)
      ]) as unknown as Map<K, V>
    )
    return stillValidMap.size
  }

  override delete(key: K): boolean {
    const innerKey = this.getInnerKey(key)
    if (isObject(key)) {
      const ref = this.objectKeyMap.get(key)
      if (ref) {
        this.reverseObjectKeyMap.delete(ref)
      }
      this.objectKeyMap.delete(key)
    }
    return this.innerStoreMap.delete(innerKey)
  }

  override clear(): void {
    return this.innerStoreMap.clear()
  }

  override has(key: K): boolean {
    return this.get(key) != null
  }

  override *keys(): IterableIterator<K> {
    for (const [trueKey] of this.entries()) {
      yield trueKey
    }
  }

  override *values(): IterableIterator<V> {
    for (const [, trueValue] of this.entries()) {
      yield trueValue
    }
  }

  override *entries(): IterableIterator<[K, V]> {
    for (const [innerKey, innerValue] of this.innerStoreMap.entries()) {
      if (isObject(innerKey)) {
        const trueKey = this.reverseObjectKeyMap.get(innerKey)
        if (!trueKey) continue
        const trueValue = derefWrapperRefIfNeeded(innerValue)
        if (trueValue != null) {
          yield [trueKey, trueValue]
        } else {
          continue
        }
      } else {
        const trueValue = derefWrapperRefIfNeeded(innerValue)
        if (trueValue != null) {
          yield [innerKey, trueValue]
        } else {
          continue
        }
      }
    }
  }
}
