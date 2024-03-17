export type Entry<Value = any, Key = any> = { key: Key; value: Value }
export type GetEntryValue<E extends Entry> = E["value"]
export type GetEntryKey<E extends Entry> = E["key"]
export type ItemEntry<Item = any> = Entry<Item, number>

export type GetCollectionKey<T extends Collection> = T extends Array<unknown>
  ? number
  : T extends Set<any>
  ? number
  : T extends Map<infer K, unknown>
  ? K
  : T extends Iterable<unknown>
  ? number
  : T extends Record<infer K, unknown>
  ? K
  : T extends undefined
  ? undefined
  : never

export type GetCollectionValue<T extends Collection> = T extends Array<infer V>
  ? V
  : T extends Set<infer V>
  ? V
  : T extends Map<unknown, infer V>
  ? V
  : T extends Iterable<infer V>
  ? V
  : T extends Record<keyof any, infer V>
  ? V
  : T extends undefined
  ? undefined
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

export type Items<V = any> = Set<V> | V[] | IterableIterator<V> | Iterable<V> | undefined

export type Entries<V = any, K = any> =
  | Map<K, V>
  | Record<K & string, V>
  | IterableIterator<V>
  | Iterable<V>
  | undefined

export type Collection<V = any, K = any> = Items<V> | Entries<V, K>
