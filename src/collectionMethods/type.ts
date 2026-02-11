import type { Entriable, Itemable } from "./iteratorableItemAndEntry"
import type { Iteratorable } from "./iteratorableUtils"

// Entry 类型已废弃，请使用 itemAndEntry.ts 中的 Entry 类或 Entriable 类型
// Entry type deprecated, use Entry class or Entriable type from itemAndEntry.ts

/**
 * GetCollectionKey：获取集合的键类型
 * @deprecated 使用 {@link KeyOf} 替代
 */
export type GetCollectionKey<T extends Collection> =
  T extends Array<any>
    ? number
    : T extends Set<infer K>
      ? K
      : T extends Map<infer K, any>
        ? K
        // Entriable 流：key 来自 Entry
        : T extends Iteratorable<Entriable<any, infer K>>
          ? K
        // Item 流：key 由 Iterator Helper 生成（index）
        : T extends Iteratorable<any>
          ? number
        : T extends Record<infer K, any>
          ? K
          : never

export type GetCollectionValue<T extends Collection> =
  T extends Array<infer V>
    ? V
    : T extends Set<infer V>
      ? V
      : T extends Map<any, infer V>
        ? V
        // Entriable 流：提取 value 部分
        : T extends Iteratorable<Entriable<infer V, any>>
          ? V
        // Item 流：整个元素就是 value
        : T extends Iteratorable<infer V>
          ? V
          : T extends Record<keyof any, infer V>
            ? V
            : never

export type GetNewCollection<OldCollection extends Collection, NewValue, NewKey = GetCollectionKey<OldCollection>> =
  OldCollection extends Array<any>
    ? Array<NewValue>
    : OldCollection extends ReadonlyArray<any>
      ? ReadonlyArray<NewValue>
      : OldCollection extends Map<any, any>
        ? Map<NewKey, NewValue>
        : OldCollection extends ReadonlyMap<any, any>
          ? ReadonlyMap<NewKey, NewValue>
          : OldCollection extends Set<any>
            ? Set<NewValue>
            : OldCollection extends ReadonlySet<any>
              ? ReadonlySet<NewValue>
              : OldCollection extends {
                    [k: string | number | symbol]: any
                  }
                ? {
                    [k in keyof OldCollection]: NewValue
                  }
                : never

/**
 * CollectionItems：单值集合
 * Item collections: collections containing single values
 * 
 * - Array：索引是 key
 * - Set：value 即 key
 * - Iteratorable<Item>：Iterator Helper 生成 index 作为 key
 */
export type CollectionItems<V = any> = 
  | V[]
  | Set<V>
  | Iteratorable<Itemable<V>>  // Item 流

/**
 * CollectionEntries：键值对集合
 * Entry collections: collections containing key-value pairs
 * 
 * - Map：显式的 key-value
 * - Record：对象的 key-value
 * - Iteratorable<Entriable>：Entry 流，key 由 Entry 携带
 */
export type CollectionEntries<V = any, K = any> = 
  | Map<K, V>
  | Record<K & string, V>
  | Iteratorable<Entriable<V, K>>  // Entriable 流

/**
 * Collection：所有集合类型的联合
 * Collection: union of all collection types
 */
export type Collection<V = any, K = any> = 
  | CollectionItems<V> 
  | CollectionEntries<V, K>
