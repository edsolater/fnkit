export type Entry<Value = any, Key = any> = { key: Key; value: Value } | [Key, Value]
export type GetEntryValue<E extends Entry> = E extends [infer K, infer V]
  ? V
  : E extends { key: infer K; value: infer V }
  ? V
  : never
export type GetEntryKey<E extends Entry> = E extends [infer K, infer V]
  ? K
  : E extends { key: infer K; value: infer V }
  ? K
  : never
export type ItemEntry<Item = any> = Entry<Item, number>

export type GetCollectionKey<T extends Collection> = T extends Array<any>
  ? number
  : T extends Set<infer K>
  ? K
  : T extends Map<infer K, any>
  ? K
  : T extends Iterable<any>
  ? number
  : T extends Record<infer K, any>
  ? K
  : never

export type GetCollectionValue<T extends Collection> = T extends Array<infer V>
  ? V
  : T extends Set<infer V>
  ? V
  : T extends Map<any, infer V>
  ? V
  : T extends Iterable<infer V>
  ? V
  : T extends Record<keyof any, infer V>
  ? V
  : never

export type GetNewCollection<
  OldCollection extends Collection,
  NewValue,
  NewKey = GetCollectionKey<OldCollection>,
> = OldCollection extends Array<any>
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
  : OldCollection extends Record<any, any>
  ? Record<Extract<NewKey, string | number | symbol>, NewValue>
  : never

// TODO: should can iterator , because iterator can have iterator helpers. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/forEach
export type Items<V = any> = Set<V> | V[] | IterableIterator<V> | Iterable<V> | undefined

export type Entries<V = any, K = any> =
  | Map<K, V>
  | Record<K & string, V>
  | IterableIterator<V>
  | Iterable<V>
  | undefined

export type Collection<V = any, K = any> = Items<V> | Entries<V, K>
