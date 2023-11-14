import { isObject } from '../dataType'

const createWrapperRef = <T extends object>(v: T) => new WeakRef(v)
const createWrapperRefIfNeeded = <T>(v: T) => (isObject(v) ? createWrapperRef(v) : v)
const derefWrapperRefIfNeeded = <T>(v: T) => (v instanceof WeakRef ? v.deref() : v)

/** it wont prevent GC for both key and value , and weakMap can be traverse
 * @todo test it!!!
 */
export class WeakerMap<K, V> extends Map<K, V> {
  private innerKeys: WeakMap<K & object, WeakRef<K & object>> = new WeakMap()
  // could find by value
  private reverseInnerKeys: WeakMap<WeakRef<K & object>, K & object> = new WeakMap()

  // if key is object , it wrap weakRef to allow GC
  private innerMap: Map<K | WeakRef<K & object>, V | WeakRef<V & object>> = new Map() // must have a Map to looply access key

  constructor()
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries)
    entries?.forEach(([k, v]) => this.set(k, v))
  }

  /** 
   * if it's object, result is weakRef
   * may be ref
   */
  private getInnerKey(key: K) {
    if (isObject(key)) {
      if (!this.innerKeys.has(key)) {
        const refedValue = createWrapperRef(key)
        this.innerKeys.set(key, refedValue)
        this.reverseInnerKeys.set(refedValue, key)
      }
      return this.innerKeys.get(key)!
    } else {
      return key
    }
  }

  override set(key: K, value: V): this {
    const innerKey = this.getInnerKey(key)
    this.innerMap.set(innerKey, createWrapperRefIfNeeded(value))
    return this
  }

  override get(key: K): V | undefined {
    const innerKey = this.getInnerKey(key)
    return derefWrapperRefIfNeeded(this.innerMap.get(innerKey))
  }

  override forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (const [innerKey, refVlue] of this.innerMap.entries()) {
      const trueKey = derefWrapperRefIfNeeded(innerKey)
      const trueValue = derefWrapperRefIfNeeded(refVlue)
      if (trueKey != null) {
        callbackfn(trueValue, trueKey, thisArg ?? this)
      }
    }
  }

  override get size() {
    let count = 0
    for (const innerKey of this.innerMap.keys()) {
      const trueKey = derefWrapperRefIfNeeded(innerKey)
      if (trueKey != null) {
        count++
      }
    }
    return count
  }

  override delete(key: K): boolean {
    const innerKey = this.getInnerKey(key)
    if (isObject(key)) {
      const ref = this.innerKeys.get(key)
      if (ref) {
        this.reverseInnerKeys.delete(ref)
      }
      this.innerKeys.delete(key)
    }
    return this.innerMap.delete(innerKey)
  }

  override clear(): void {
    return this.innerMap.clear()
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
    for (const [innerKey, innerValue] of this.innerMap.entries()) {
      if (isObject(innerKey)) {
        const trueKey = this.reverseInnerKeys.get(innerKey)
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

  override [Symbol.iterator]() {
    return this.entries()
  }
}
