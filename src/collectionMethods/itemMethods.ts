import { forEach, getIteratorInnerKey, getIteratorInnerValue, type Keyof, type ValueOf } from ".."
import { getType, isArray, isIterable, isMap, isNumber, isObject, isSet, isString, isUndefined } from "../dataType"
import { cloneObject } from "../objectUtils/objectUtils"
import { shrinkFn } from "../wrapper"
import { isIterableOrIterator } from "./iteratorableUtils"
import { toCollectionIterator } from "./iterableCollectionUtils"
import { pick } from "./pick"
import { Collection, type GetCollectionKey, type GetCollectionValue } from "./type"

/** accept all may iterable data type */
export function toList<T = any>(i: T): Array<ValueOf<T>> {
  if (isUndefined(i)) return []
  if (isArray(i)) return i
  if (isSet(i)) return i.values().toArray() as Array<ValueOf<T>>
  if (isMap(i)) return i.values().toArray() as Array<ValueOf<T>>
  if (isIterableOrIterator(i)) {
    const iterator = toCollectionIterator(i)
    const valueIterator = iterator.map((item) => getIteratorInnerValue(item))
    return valueIterator.toArray() as Array<ValueOf<T>>
  }
  if (isObject(i)) return Object.values(i)
  throw new Error(`toList: unsupported collection type: ${getType(i)}`)
}

export function toMap<T extends Collection>(i: T, key?: (item: ValueOf<T>, key: Keyof<T>) => any) {
  if (isUndefined(i)) return new Map()
  if (isMap(i)) return i
  if (isArray(i)) return new Map(i.map((item, index) => [key?.(item, index as Keyof<T>) ?? item, item]))
  if (isSet(i))
    return new Map([...i.values()].map((item, index) => [key?.(item as ValueOf<T>, index as Keyof<T>) ?? item, item]))
  if (isIterableOrIterator(i)) {
    const iterator = toCollectionIterator(i)
    const entryIterator = iterator.map((item) => [getIteratorInnerKey(item), getIteratorInnerValue(item)] as const)
    return new Map(entryIterator)
  }
  if (isObject(i)) return new Map(Object.entries(i))

  throw new Error(`toMap: unsupported collection type: ${getType(i)}`)
}

export function toSet<T>(i: Collection<T>) {
  if (isUndefined(i)) return new Set()
  if (isSet(i)) return i
  if (isArray(i)) return new Set(i)
  if (isIterableOrIterator(i)) {
    const iterator = toCollectionIterator(i)
    const valueIterator = iterator.map((item) => getIteratorInnerValue(item))
    return new Set(valueIterator)
  }
  if (isObject(i)) return new Set(Object.values(i))
  throw new Error(`toSet: unsupported collection type: ${getType(i)}`)
}

export function toRecord<T extends Collection, K extends keyof any>(
  collection: T,
  key: (item: ValueOf<T>, key: Keyof<T>) => K,
): Record<K, ValueOf<T>> {
  if (isUndefined(collection)) return {} as Record<K, ValueOf<T>>
  if (isMap(collection) || isSet(collection) || isArray(collection) || isIterable(collection)) {
    const result = {} as Record<K, ValueOf<T>>
    forEach(collection, (v, k) => {
      // @ts-ignore
      result[key(v, k)] = v
    })
    return result
  }
  if (isObject(collection)) return collection as Record<K, ValueOf<T>>
  throw new Error(`toRecord: unsupported collection type: ${getType(collection)}`)
}

export function count(i: Collection) {
  if (isMap(i) || isSet(i)) return i.size
  if (isArray(i)) return i.length
  if (isIterableOrIterator(i)) {
    const iterable = toCollectionIterator(i)
    let count = 0
    for (const _ of iterable) {
      count++
    }
    return count
  }
  if (isObject(i)) return Object.keys(i).length
  throw new Error(`count: unsupported collection type: ${getType(i)}`)
}

/**
 * get value of Itemsable, regardless of order
 */
export function get<C extends Collection>(collection: C, key: GetCollectionKey<C>): GetCollectionValue<C> | undefined {
  if (isMap(collection)) return collection.get(key) as any
  if (isArray(collection) && isNumber(key)) return collection.at(key) as any
  if (isSet(collection) && isNumber(key)) return Array.from(collection).at(key) as any
  if (isIterable(collection) && isNumber(key)) {
    let index = 0
    for (const item of collection) {
      if (index === key) return item
      index++
    }
  }
  return collection[key]
}

export function getFirstItem<T>(i: Collection<T>) {
  return getByIndex(i, 0)
}

export function getLastItem<T>(i: Collection<T>) {
  return getByIndex(i, count(i) - 1)
}

/** mutate, no key */
export function addItemMutable<T, U>(i: Array<T>, value: U): Array<T | U>
export function addItemMutable<T, U>(i: Set<T>, value: U): Set<T | U>
export function addItemMutable<T, K, U>(i: Map<K, T>, value: U): Map<K | number, T | U>
export function addItemMutable<T extends object, U>(i: T, value: U): T & { [key: number]: U }
export function addItemMutable<T>(i: Collection<T>, value: T) {
  if (isUndefined(i)) return
  if (isMap(i)) {
    return i.set(i.size, value)
  } else if (isArray(i)) {
    const newArray = i
    newArray.push(value)
    return newArray
  } else if (isSet(i)) {
    const newSet = i
    return newSet.add(value)
  } else if (isIterable(i)) {
    throw new Error("Iterable does not support add")
  } else {
    const newRecord = i
    newRecord[count(i)] = value
    return newRecord
  }
}
/** immutably, no key */
export function addItem<T, U>(i: Array<T>, ...values: U[]): Array<T | U>
export function addItem<T, U>(i: Set<T>, ...values: U[]): Set<T | U>
export function addItem<T, K, U>(i: Map<K, T>, ...values: U[]): Map<K | number, T | U>
export function addItem<T extends object, U>(i: T, ...values: U[]): T & { [key: number]: U }
export function addItem<T>(i: Collection<T>, ...values: T[]) {
  if (isUndefined(i)) return i
  if (isMap(i)) {
    const newMap = new Map(i)
    for (const element of values) {
      newMap.set(newMap.size, element)
    }
    return newMap
  }
  if (isArray(i)) {
    return [...i, ...values]
  }
  if (isSet(i)) {
    return new Set([...i, ...values])
  }
  if (isIterable(i)) {
    throw new Error("Iterable does not support add")
  } else {
    const newRecord = cloneObject(i)
    const n = count(i)
    for (let i = 0; i < values.length; i++) {
      newRecord[n + i] = values[i]
    }
    return newRecord
  }
}
/** have key */
export function setItemMutable<T, U>(i: Array<T>, key: number, value: U | ((v: T | undefined) => U)): Array<T | U>
export function setItemMutable<T, U>(i: Set<T>, key: number, value: U | ((v: T | undefined) => U)): Set<T | U>
export function setItemMutable<T, K, U>(i: Map<K, T>, key: K, value: U | ((v: T | undefined) => U)): Map<K, T | U>
export function setItemMutable<T extends object, K extends keyof any, U>(
  i: T,
  key: K,
  value: U | ((v: T[K extends keyof T ? K : keyof T] | undefined) => U),
): T & { [key in K]: U }
export function setItemMutable<T>(i: Collection<T>, key: unknown, value: T | ((v: T | undefined) => T)) {
  if (isUndefined(i)) return
  if (isMap(i)) {
    const newMap = i
    newMap.set(key, shrinkFn(value, [i.get(key)]))
    return newMap
  } else if (isArray(i) && isNumber(key)) {
    const newArray = i
    newArray[key] = shrinkFn(value, [i[key]])
    return newArray
  } else if (isSet(i) && isNumber(key)) {
    const values = [...i.values()]
    values[key] = shrinkFn(value, [values[key]])
    i.clear()
    values.forEach((v) => i.add(v))
    return i
  } else if (isIterable(i)) {
    throw new Error("Iterable does not support set")
  } else {
    if (isString(key) || isNumber(key)) {
      const newRecord = i
      newRecord[key] = shrinkFn(value, [i[key]])
      return newRecord
    }
  }
}

export function setItem<T, U>(i: Array<T>, key: number, value: U | ((v: T | undefined) => U)): Array<T | U>
export function setItem<T, U>(i: Set<T>, key: number, value: U | ((v: T | undefined) => U)): Set<T | U>
export function setItem<T, K, U>(i: Map<K, T>, key: K, value: U | ((v: T | undefined) => U)): Map<K, T | U>
export function setItem<T extends object, K extends keyof any, U>(
  i: T,
  key: K,
  value: U | ((v: T[K extends keyof T ? K : keyof T] | undefined) => U),
): T & { [key in K]: U }
export function setItem<T>(i: Collection<T>, key: unknown, value: T | ((v: T | undefined) => T)) {
  if (isUndefined(i)) return i
  if (isMap(i)) {
    const newMap = new Map(i)
    newMap.set(key, shrinkFn(value, [i.get(key)]))
    return newMap
  } else if (isArray(i) && isNumber(key)) {
    const newArray = [...i]
    newArray[key] = shrinkFn(value, [i[key]])
    return newArray
  } else if (isSet(i) && isNumber(key)) {
    const values = [...i.values()]
    values[key] = shrinkFn(value, [values[key]])
    return new Set(values)
  } else if (isIterable(i)) {
    throw new Error("Iterable does not support set")
  } else {
    if (isString(key) || isNumber(key)) {
      const newRecord = cloneObject(i)
      newRecord[key] = shrinkFn(value, [i[key]])
      return newRecord
    }
  }
}

export function deleteItemMutable<T>(i: Array<T>, key: number): Array<T>
export function deleteItemMutable<T>(i: Set<T>, key: number): Set<T>
export function deleteItemMutable<T, K>(i: Map<K, T>, key: K): Map<K, T>
export function deleteItemMutable<T extends object, K extends keyof any>(i: T, key: K): T
export function deleteItemMutable<T>(i: Collection<T>, key: any) {
  if (isUndefined(i)) return
  if (isMap(i)) {
    const newMap = i
    newMap.delete(key)
    return newMap
  } else if (isArray(i) && isNumber(key)) {
    const newArray = i
    newArray.splice(key, 1)
    return newArray
  } else if (isSet(i) && isNumber(key)) {
    const values = [...i.values()]
    values.splice(key, 1)
    i.clear()
    values.forEach((v) => i.add(v))
    return i
  } else if (isIterable(i)) {
    throw new Error("Iterable does not support delete")
  } else {
    if (isString(key) || isNumber(key)) {
      const newRecord = i
      delete newRecord[key]
      return newRecord
    }
  }
}

/**
 * get first value of Itemsable
 */
export function getByIndex(i: Collection, order: number) {
  if (isUndefined(i)) return undefined
  const key = isUndefined(i) || isArray(i) || isSet(i) || isIterable(i) ? order : Object.keys(i)[order]
  return get(i, key)
}

/**
 * like set/map's has, but can use for all Itemsable
 *
 */
export function hasValue<T>(i: Collection<T>, item: T) {
  if (isUndefined(i)) return false
  if (isMap(i)) return new Set(i.values()).has(item)
  if (isArray(i)) return i.includes(item)
  if (isSet(i)) return i.has(item)
  if (isIterable(i)) {
    for (const _item of i) {
      if (_item === item) return true
    }
    return false
  }
  if (isObject(i)) {
    for (const _item of Object.values(i)) {
      if (_item === item) return true
    }
    return false
  }
  return false
}

/**
 * {@link hasValue} is for value, this is for key
 */
export function has<T>(i: Collection<T>, key: any) {
  if (isUndefined(i)) return false
  if (isMap(i)) return i.has(key)
  if (isArray(i) && isNumber(key)) return i[key] !== undefined
  if (isSet(i) && isNumber(key)) return i.size > key
  if (isIterable(i) && isNumber(key)) {
    let index = 0
    for (const _ of i) {
      if (index === key) return true
      index++
    }
    return false
  }
  return i[key] !== undefined
}

export function turncate<T extends Collection>(i: T, count?: number): T
export function turncate<T extends Collection>(i: T, range?: [start: number, end?: number]): T
export function turncate<T extends Collection>(i: T, num?: [start: number, end?: number] | number): T {
  if (num == null) return i
  const range = isArray(num) ? num : [0, num]
  if (isUndefined(i)) return i
  if (isMap(i)) return new Map([...i.entries()].slice(...range)) as T
  if (isArray(i)) return i.slice(...range) as T
  if (isSet(i)) return new Set([...i.values()].slice(...range)) as T
  if (isIterable(i)) {
    const result = new Set<T>()
    let index = 0
    for (const item of i) {
      if (index >= range[0] && (isUndefined(range[1]) || index < range[1])) {
        result.add(item)
      }
      index++
    }
    return result.values() as any
  } else {
    const newKeys = Object.keys(i).slice(...range)
    return pick(i, newKeys) as T
  }
}
