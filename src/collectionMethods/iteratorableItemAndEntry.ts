/**
 * Item 和 Entriable 的完整定义体系
 * Complete definition system for Item and Entriable
 */

import { assert } from "console"
import { isArray, isObject } from "../dataType"

//#region ------------------- Item -------------------

/**
 * Item 类型：单值包装
 * Item type: single value wrapper
 *
 * Item 可以包裹任何值，包括数组、对象等
 * Item can wrap any value, including arrays, objects, etc.
 *
 * @example
 * Item.of(1) // Item<number>
 * Item.of(['a', 'b']) // Item<string[]> - 数组本身作为值
 * Item.of([1, 2]) // Item<[number, number]> - 二元组也被视为单值
 */
export class Item<V> {
  constructor(public readonly value: V) {}

  /**
   * 创建 Item 实例
   * Create an Item instance
   */
  static of<V>(value: V): Item<V> {
    return new Item(value)
  }
}

/**
 * Itemable 类型：可以被视为 Item 的数据
 * Itemable type: data that can be treated as an Item
 */
export type Itemable<V = any> = V | Item<V>

/**
 * 类型守卫：判断是否为 Item 实例
 * Type guard: check if value is an Item instance
 */
export function isItem(v: any): v is Item<any> {
  return v instanceof Item
}

export function isItemable(v: any): v is Itemable<any> {
  return isItem(v) || !isEntriable(v)
}

/**
 * 从 Itemable 提取值
 * Extract value from Itemable
 */
export function getItemableValue<V>(item: Itemable<V>): V {
  return isItem(item) ? item.value : item
}

export type ItemableValue<T> = T extends Itemable<infer V> ? V : never
//#endregion

//#region ------------------- Entriable -------------------

/**
 * Entriable 类型：键值对的三种表现形式
 * Entriable type: three forms of key-value pairs
 *
 * 1. 二元组形式：[value, key]
 * 2. 对象形式：{ value, key }
 * 3. Entry 类实例
 *
 * 注意：只有恰好长度为 2 的数组才是 Entriable
 * Note: Only arrays with exactly 2 elements are Entriable
 */
export type Entriable<V = any, K = any> =
  | [V, K] // 二元组形式
  | { value: V; key: K } // 对象形式
  | Entry<V, K> // Entry 类实例

/**
 * Entry 类：键值对的类表示
 * Entry class: class representation of key-value pair
 */
export class Entry<V, K> {
  kind = "Entry"
  
  value: V
  key: K

  constructor(value: V, key: K) {
    this.value = value
    this.key = key
  }


  /**
   * 创建 Entry 实例
   * Create an Entry instance
   */
  static of<V, K>(value: V, key: K): Entry<V, K> {
    return new Entry(value, key)
  }
}

/**
 * 类型守卫：判断是否为 Entry 类实例
 * Type guard: check if value is an Entry instance
 */
export function isEntry(v: any): v is Entry<any, any> {
  return v instanceof Entry
}

/**
 * 类型守卫：判断是否为 Entriable（任何形式）
 * Type guard: check if value is Entriable (any form)
 *
 * 判断规则：
 * - 恰好长度为 2 的数组
 * - 有 value 和 key 属性的对象
 * - Entry 类实例
 */
export function isEntriable(v: any): v is Entriable {
  // Entry 类实例
  if (isEntry(v)) return true

  // 恰好二元组（不是大于等于 2，必须等于 2）
  if (isArray(v) && v.length === 2) return true

  // 有 value 和 key 属性的对象
  if (isObject(v) && "value" in v && "key" in v) return true

  return false
}

export type EntriableKey<T> = T extends Entriable<any, infer K> ? K : never
/**
 * 从 Entriable 提取 key
 * Extract key from Entriable
 */
function getEntriableKey<K>(entry: Entriable<any, K>): K {
  if (isEntry(entry)) return entry.key
  if (isArray(entry)) return entry[1]
  if (isObject(entry) && "key" in entry) return entry.key
  throw new Error("error of get entry's key")
}

export type EntriableValue<T> = T extends Entriable<infer V, any> ? V : never
/**
 * 从 Entriable 提取 value
 * Extract value from Entriable
 */
function getEntriableValue<V>(entry: Entriable<V, any>): V {
  if (isEntry(entry)) return entry.value
  if (isArray(entry)) return entry[0]
  if (isObject(entry) && "value" in entry) return entry.value
  throw new Error("error of get entry's value")
}

/**q
 * 标准化为统一的 Entry 对象形式
 * Normalize to unified Entry object form
 */
export function normalizeEntry<V, K>(entriable: Entriable<V, K>): { value: V; key: K } {
  return { value: getEntriableValue(entriable), key: getEntriableKey(entriable) }
}

export function getIteratorInnerKey<K>(entry: Entriable<any, K>): K
export function getIteratorInnerKey<T>(entry: Itemable<any>): undefined
export function getIteratorInnerKey<T>(value: T): undefined
export function getIteratorInnerKey(value: any): any {
  if (isEntriable(value)) {
    return getEntriableKey(value)
  }
  // 如果是 Itemable 或者普通值，返回 undefined
  // If it's Itemable or plain value, return undefined
  return undefined
}

export function getIteratorInnerValue<V>(entry: Entriable<V, any>): V
export function getIteratorInnerValue<T>(entry: Itemable<T>): T
export function getIteratorInnerValue<T>(value: T): T
export function getIteratorInnerValue(value: any): any {
  if (isEntriable(value)) {
    return getEntriableValue(value)
  }
  if (isItemable(value)) {
    return value
  }
  // 普通值直接返回
  // Plain value returns directly
  return value
}
