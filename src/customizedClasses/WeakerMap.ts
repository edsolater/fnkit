import { isObject } from "../dataType"

const createWrapperRef = <T extends object>(v: T) => new WeakRef(v)
const createWrapperRefIfNeeded = <T>(v: T) => (isObject(v) ? createWrapperRef(v) : v)
const derefWrapperRefIfNeeded = <T>(v: T) => (v instanceof WeakRef ? v.deref() : v)

/** 
 * it wont prevent GC for both key and value , and weakMap can be traverse
 * 
 * ! it relay on WebAPI's {@link FinalizationRegistry} and WEAKREF
 * 
 * @todo test it!!!
 */
export class WeakerMap<K, V>  {
  private innerKeyMap: WeakMap<K & object, WeakRef<K & object>> = new WeakMap()
  // could find by value
  private reverseInnerKeys: WeakMap<WeakRef<K & object>, K & object> = new WeakMap()

  // if key is object , it wrap weakRef to allow GC
  private innerValueMap: Map<K | WeakRef<K & object>, V | WeakRef<V & object>> = new Map() // must have a Map to looply access key

  // to release GC'ed object's hold value
  private finalizationRegistry = new FinalizationRegistry((innerKey: any) => {
    this.innerValueMap.delete(innerKey)
  })

  constructor()
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    entries?.forEach(([k, v]) => this.set(k, v))
  }

  /**
   * if it's object, result is weakRef
   * may be ref
   */
  private getInnerKey(key: K) {
    if (isObject(key)) {
      if (!this.innerKeyMap.has(key)) {
        const refedValue = createWrapperRef(key)
        this.innerKeyMap.set(key, refedValue)
        this.reverseInnerKeys.set(refedValue, key)
        this.finalizationRegistry.register(key, refedValue)
      }
      return this.innerKeyMap.get(key)!
    } else {
      return key
    }
  }

  set(key: K, value: V): this {
    const innerKey = this.getInnerKey(key)
    this.innerValueMap.set(innerKey, createWrapperRefIfNeeded(value))
    return this
  }

  get(key: K): V | undefined {
    const innerKey = this.getInnerKey(key)
    return derefWrapperRefIfNeeded(this.innerValueMap.get(innerKey))
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (const [innerKey, refVlue] of this.innerValueMap.entries()) {
      const trueKey = derefWrapperRefIfNeeded(innerKey)
      const trueValue = derefWrapperRefIfNeeded(refVlue)
      if (trueKey != null) {
        callbackfn(trueValue, trueKey, thisArg ?? this)
      }
    }
  }

  get size() {
    let count = 0
    for (const innerKey of this.innerValueMap.keys()) {
      const trueKey = derefWrapperRefIfNeeded(innerKey)
      if (trueKey != null) {
        count++
      }
    }
    return count
  }

  delete(key: K): boolean {
    const innerKey = this.getInnerKey(key)
    if (isObject(key)) {
      const ref = this.innerKeyMap.get(key)
      if (ref) {
        this.reverseInnerKeys.delete(ref)
      }
      this.innerKeyMap.delete(key)
    }
    return this.innerValueMap.delete(innerKey)
  }

  clear(): void {
    return this.innerValueMap.clear()
  }

  has(key: K): boolean {
    return this.get(key) != null
  }

  *keys(): IterableIterator<K> {
    for (const [trueKey] of this.entries()) {
      yield trueKey
    }
  }

  *values(): IterableIterator<V> {
    for (const [, trueValue] of this.entries()) {
      yield trueValue
    }
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [innerKey, innerValue] of this.innerValueMap.entries()) {
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

  [Symbol.iterator]() {
    return this.entries()
  }

  get [Symbol.toStringTag]() {
    return `WeakerMap<${this.size}>`
  }

  get [Symbol.species]() {
    return WeakerMap
  }
}

/**
 *
 * check if v is a WeakerMap
 * @param v to be checked value
 * @returns boolean
 */
export function isWeakerMap(v: any): v is WeakerMap<any, any> {
  return v instanceof WeakerMap
}
