import { forEach, getIteratorInnerKey, getIteratorInnerValue, type Keyof, type ValueOf } from ".."
import { getType, isArray, isIterable, isMap, isNumber, isObject, isSet, isString, isUndefined } from "../dataType"
import { cloneObject } from "../objectUtils/objectUtils"
import { shrinkFn } from "../wrapper"
import { isIterableOrIterator, toIterator } from "./iteratorableUtils"
import { toCollectionIterator } from "./iterableCollectionUtils"
import { pick } from "./pick"
import { Collection, type GetCollectionKey, type GetCollectionValue } from "./type"

type ValueMapper<T extends Collection, R> = (value: ValueOf<T>, key: Keyof<T>) => R
type KeyMapper<T extends Collection, K> = (value: ValueOf<T>, key: Keyof<T>) => K

function mapCollectionValue<T extends Collection, R>(
  value: ValueOf<T>,
  key: Keyof<T>,
  valueMapper?: ValueMapper<T, R>,
): ValueOf<T> | R {
  return valueMapper ? valueMapper(value, key) : value
}

/**
 * 将类集合数据转换为值数组。
 *
 * 支持 Array、Set、Map、普通对象、Iterable 和 Iterator。调用 `valueMapper`
 * 时，Map/普通对象会使用原始 key；Array、Set 和普通 item 迭代流使用数字下标；
 * entry 迭代流（`Entry`、`[value, key]`、`{ value, key }`）使用 entry 自带的 key。
 *
 * @param i 来源集合。`undefined` 会按空集合处理。
 * @param valueMapper 可选的值映射函数，返回值会原样进入结果，包括 `undefined`。
 * @returns 包含原始值或映射后值的新数组。
 */
export function toList(i: undefined): []
export function toList<T extends Collection>(i: T): Array<ValueOf<T>>
export function toList<T extends Collection, R>(i: T, valueMapper: ValueMapper<T, R>): R[]
export function toList<T extends Collection, R>(i: T | undefined, valueMapper?: ValueMapper<T, R>) {
  if (isUndefined(i)) return []
  if (isArray(i)) return i.map((item, index) => mapCollectionValue(item as ValueOf<T>, index as Keyof<T>, valueMapper))
  if (isSet(i))
    return [...i.values()].map((item, index) => mapCollectionValue(item as ValueOf<T>, index as Keyof<T>, valueMapper))
  if (isMap(i))
    return [...i.entries()].map(([key, item]) => mapCollectionValue(item as ValueOf<T>, key as Keyof<T>, valueMapper))
  if (isIterableOrIterator(i)) {
    let index = 0
    const iterator = toIterator(i)
    const valueIterator = iterator.map((item) => {
      const itemKey = (getIteratorInnerKey(item) ?? index) as Keyof<T>
      const itemValue = getIteratorInnerValue(item) as ValueOf<T>
      index++
      return mapCollectionValue(itemValue, itemKey, valueMapper)
    })
    return valueIterator.toArray()
  }
  if (isObject(i))
    return Object.entries(i).map(([key, item]) => mapCollectionValue(item as ValueOf<T>, key as Keyof<T>, valueMapper))
  throw new Error(`toList: unsupported collection type: ${getType(i)}`)
}

/**
 * 将类集合数据转换为 Map。
 *
 * 默认情况下，Map、普通对象和 entry 迭代流会保留已有 key。Array 和 Set
 * 会用 item 本身作为输出 Map 的 key。可以通过 `key` 计算输出 key，通过
 * `valueMapper` 计算输出 value。
 *
 * @param i 来源集合。`undefined` 会按空集合处理。
 * @param key 可选的输出 key 映射函数。
 * @param valueMapper 可选的输出 value 映射函数，返回值会原样进入结果，包括 `undefined`。
 * @returns 包含转换后 entry 的 Map。
 */
export function toMap<T extends Collection>(i: T): Map<any, ValueOf<T>>
export function toMap<T extends Collection, K>(i: T, key: KeyMapper<T, K>): Map<K, ValueOf<T>>
export function toMap<T extends Collection, K, R>(
  i: T,
  key: KeyMapper<T, K> | undefined,
  valueMapper: ValueMapper<T, R>,
): Map<K | Keyof<T>, R>
export function toMap<T extends Collection>(
  i: T,
  key?: KeyMapper<T, any>,
  valueMapper?: ValueMapper<T, any>,
) {
  if (isUndefined(i)) return new Map()
  if (isMap(i)) {
    if (!key && !valueMapper) return i
    return new Map(
      [...i.entries()].map(([itemKey, item]) => [
        key ? key(item as ValueOf<T>, itemKey as Keyof<T>) : itemKey,
        mapCollectionValue(item as ValueOf<T>, itemKey as Keyof<T>, valueMapper),
      ]),
    )
  }
  if (isArray(i))
    return new Map(
      i.map((item, index) => [
        key ? key(item as ValueOf<T>, index as Keyof<T>) : item,
        mapCollectionValue(item as ValueOf<T>, index as Keyof<T>, valueMapper),
      ]),
    )
  if (isSet(i))
    return new Map(
      [...i.values()].map((item, index) => [
        key ? key(item as ValueOf<T>, index as Keyof<T>) : item,
        mapCollectionValue(item as ValueOf<T>, index as Keyof<T>, valueMapper),
      ]),
    )
  if (isIterableOrIterator(i)) {
    let index = 0
    const iterator = toIterator(i)
    const entryIterator = iterator.map((item) => {
      const itemKey = (getIteratorInnerKey(item) ?? index) as Keyof<T>
      const itemValue = getIteratorInnerValue(item) as ValueOf<T>
      index++
      return [key ? key(itemValue, itemKey) : itemKey, mapCollectionValue(itemValue, itemKey, valueMapper)] as const
    })
    return new Map(entryIterator)
  }
  if (isObject(i))
    return new Map(
      Object.entries(i).map(([itemKey, item]) => [
        key ? key(item as ValueOf<T>, itemKey as Keyof<T>) : itemKey,
        mapCollectionValue(item as ValueOf<T>, itemKey as Keyof<T>, valueMapper),
      ]),
    )

  throw new Error(`toMap: unsupported collection type: ${getType(i)}`)
}

/**
 * 将类集合数据转换为 Set。
 *
 * 支持 Array、Set、Map、普通对象、Iterable 和 Iterator。调用 `valueMapper`
 * 时，Map/普通对象会使用原始 key；Array、Set 和普通 item 迭代流使用数字下标；
 * entry 迭代流使用 entry 自带的 key。
 *
 * @param i 来源集合。`undefined` 会按空集合处理。
 * @param valueMapper 可选的值映射函数，映射结果会被加入 Set。
 * @returns 包含原始值或映射后值的 Set。
 */
export function toSet(i: undefined): Set<never>
export function toSet<T extends Collection>(i: T): Set<ValueOf<T>>
export function toSet<T extends Collection, R>(i: T, valueMapper: ValueMapper<T, R>): Set<R>
export function toSet<T extends Collection, R>(i: T | undefined, valueMapper?: ValueMapper<T, R>) {
  if (isUndefined(i)) return new Set()
  if (isSet(i)) {
    if (!valueMapper) return i
    return new Set([...i.values()].map((item, index) => valueMapper(item as ValueOf<T>, index as Keyof<T>)))
  }
  if (isArray(i)) return new Set(i.map((item, index) => mapCollectionValue(item as ValueOf<T>, index as Keyof<T>, valueMapper)))
  if (isMap(i))
    return new Set([...i.entries()].map(([key, item]) => mapCollectionValue(item as ValueOf<T>, key as Keyof<T>, valueMapper)))
  if (isIterableOrIterator(i)) {
    let index = 0
    const iterator = toIterator(i)
    const valueIterator = iterator.map((item) => {
      const itemKey = (getIteratorInnerKey(item) ?? index) as Keyof<T>
      const itemValue = getIteratorInnerValue(item) as ValueOf<T>
      index++
      return mapCollectionValue(itemValue, itemKey, valueMapper)
    })
    return new Set(valueIterator)
  }
  if (isObject(i))
    return new Set(
      Object.entries(i).map(([key, item]) => mapCollectionValue(item as ValueOf<T>, key as Keyof<T>, valueMapper)),
    )
  throw new Error(`toSet: unsupported collection type: ${getType(i)}`)
}

/**
 * 将类集合数据转换为普通 record。
 *
 * 因为 record 的 key 必须是 string、number 或 symbol，所以 `key` 回调是必填的。
 * `valueMapper` 只负责转换最终存入 record 的 value，和 key 选择保持分离。
 *
 * @param collection 来源集合。`undefined` 会按空集合处理。
 * @param key 输出 record key 的映射函数。
 * @param valueMapper 可选的输出 value 映射函数。
 * @returns 由来源 item 生成属性的普通对象。
 */
export function toRecord<T extends Collection, K extends keyof any>(
  collection: T,
  key: (item: ValueOf<T>, key: Keyof<T>) => K,
): Record<K, ValueOf<T>>
export function toRecord<T extends Collection, K extends keyof any, R>(
  collection: T,
  key: (item: ValueOf<T>, key: Keyof<T>) => K,
  valueMapper: ValueMapper<T, R>,
): Record<K, R>
export function toRecord<T extends Collection, K extends keyof any, R>(
  collection: T,
  key: (item: ValueOf<T>, key: Keyof<T>) => K,
  valueMapper?: ValueMapper<T, R>,
) {
  if (isUndefined(collection)) return {} as Record<K, ValueOf<T> | R>
  if (isMap(collection) || isSet(collection) || isArray(collection) || isIterable(collection)) {
    const result = {} as Record<K, ValueOf<T> | R>
    forEach(collection, (v, k) => {
      result[key(v as ValueOf<T>, k as Keyof<T>)] = mapCollectionValue(v as ValueOf<T>, k as Keyof<T>, valueMapper)
    })
    return result
  }
  if (isObject(collection)) {
    const result = {} as Record<K, ValueOf<T> | R>
    for (const [itemKey, item] of Object.entries(collection)) {
      result[key(item as ValueOf<T>, itemKey as Keyof<T>)] = mapCollectionValue(
        item as ValueOf<T>,
        itemKey as Keyof<T>,
        valueMapper,
      )
    }
    return result
  }
  throw new Error(`toRecord: unsupported collection type: ${getType(collection)}`)
}

/**
 * 统计类集合数据中的 item 数量。
 *
 * Map 和 Set 使用 `.size`，Array 使用 `.length`，普通对象统计自身可枚举字符串 key，
 * Iterable/Iterator 会被消费后统计数量。
 *
 * @param i 来源集合。
 * @returns 集合中的 item 数量。
 */
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
 * 按 key 或 index 从集合中读取一个值。
 *
 * Map 使用 `map.get(key)`，Array 使用数字下标，Set 和通用 Iterable 使用数字迭代顺序，
 * 普通对象使用属性访问。
 *
 * @param collection 来源集合。
 * @param key 要读取的 key 或数字 index。
 * @returns 匹配到的值；key/index 不存在时返回 `undefined`。
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

/**
 * 获取类集合数据中的第一个 item。
 *
 * @param i 来源集合。
 * @returns 按迭代顺序得到的第一个值；空集合返回 `undefined`。
 */
export function getFirstItem<T>(i: Collection<T>) {
  return getByIndex(i, 0)
}

/**
 * 获取类集合数据中的最后一个 item。
 *
 * @param i 来源集合。
 * @returns 按迭代顺序得到的最后一个值；空集合返回 `undefined`。
 */
export function getLastItem<T>(i: Collection<T>) {
  return getByIndex(i, count(i) - 1)
}

/**
 * 就地向集合追加一个值。
 *
 * Array 会 push，Set 会 add，Map 会用当前 size 作为数字 key 存入，普通对象会用当前
 * item 数量作为数字 key 存入。通用 Iterable 对这个工具来说是只读结构，会抛错。
 *
 * @param i 要被修改的目标集合。
 * @param value 要追加的值。
 * @returns 修改后的同一个集合；输入为 `undefined` 时返回 `undefined`。
 */
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

/**
 * 不修改原集合，返回追加值后的新集合。
 *
 * Array 返回新数组，Set 返回新 Set，Map 返回新 Map 并使用递增数字 key，
 * 普通对象返回追加了数字 key 的克隆对象。通用 Iterable 对这个工具来说是只读结构，会抛错。
 *
 * @param i 来源集合。
 * @param values 要追加的值。
 * @returns 追加值后的新集合。
 */
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

/**
 * 就地设置集合中的一个值。
 *
 * `value` 可以是直接值，也可以是 updater 函数；updater 会收到对应 key/index
 * 上的旧值。Set 使用数字迭代顺序定位。通用 Iterable 对这个工具来说是只读结构，会抛错。
 *
 * @param i 要被修改的目标集合。
 * @param key 要写入的 key 或数字 index。
 * @param value 新值或 updater 函数。
 * @returns 修改后的同一个集合；输入为 `undefined` 时返回 `undefined`。
 */
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

/**
 * 不修改原集合，返回设置一个值后的新集合。
 *
 * `value` 可以是直接值，也可以是 updater 函数；updater 会收到对应 key/index
 * 上的旧值。Set 使用数字迭代顺序定位。通用 Iterable 对这个工具来说是只读结构，会抛错。
 *
 * @param i 来源集合。
 * @param key 要写入的 key 或数字 index。
 * @param value 新值或 updater 函数。
 * @returns 写入值后的新集合。
 */
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

/**
 * 就地删除集合中的一个 item。
 *
 * Map 按 key 删除，Array 按数字 index splice，Set 按数字迭代顺序删除，
 * 普通对象删除对应属性。通用 Iterable 对这个工具来说是只读结构，会抛错。
 *
 * @param i 要被修改的目标集合。
 * @param key 要删除的 key 或数字 index。
 * @returns 修改后的同一个集合；输入为 `undefined` 时返回 `undefined`。
 */
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
 * 跨集合类型按数字顺序读取值。
 *
 * Array、Set 和 Iterable 直接使用数字顺序。普通对象会先通过
 * `Object.keys(i)[order]` 找到属性名。
 *
 * @param i 来源集合。
 * @param order 从 0 开始的顺序下标。
 * @returns 该顺序位置上的值；不存在时返回 `undefined`。
 */
export function getByIndex(i: Collection, order: number) {
  if (isUndefined(i)) return undefined
  const key = isUndefined(i) || isArray(i) || isSet(i) || isIterable(i) ? order : Object.keys(i)[order]
  return get(i, key)
}

/**
 * 判断集合中是否包含某个 value。
 *
 * Array 走 `includes`，Set 走 `Set.has`，Map 会检查 values；
 * 通用 Iterable 和普通对象会遍历 value 并用严格相等判断。
 *
 * @param i 来源集合。
 * @param item 要查找的 value。
 * @returns value 存在时返回 `true`。
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
 * 判断集合中是否包含某个 key 或 index。
 *
 * Map 使用 `map.has`。Array 检查对应数字位置是否不是 `undefined`。
 * Set 和 Iterable 使用数字迭代顺序。普通对象使用属性访问判断。
 *
 * @param i 来源集合。
 * @param key 要检查的 key 或数字 index。
 * @returns key/index 存在时返回 `true`。
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

/**
 * 返回集合开头的一段内容。
 *
 * 这个工具会尽量保留原来的集合大类：Array 返回 Array，Map 返回 Map，Set 返回 Set，
 * Iterable 返回选中值的 iterator，普通对象按 key 顺序返回 picked object。
 *
 * @param i 来源集合。
 * @param count 从开头保留的 item 数量。
 * @returns 只包含选中范围的新集合。
 */
export function turncate<T extends Collection>(i: T, count?: number): T
/**
 * 返回集合中的指定范围。
 *
 * 范围语义和 `slice(start, end)` 一致。省略 `end` 时会保留从 `start` 到结尾的内容。
 *
 * @param i 来源集合。
 * @param range `[start, end]` 范围元组。
 * @returns 只包含选中范围的新集合。
 */
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
