export type Entry<Value = any, Key = any> = [Key, Value]
export type ItemEntry<Item = any> = Entry<Item, number>
export type Collection<Value = any, Key = any> =
  | ArrayLikeCollection<Value>
  | ObjectLikeCollection<Value, Key>

type ArrayLikeCollection<Value = any> =
  | ReadonlyArray<Value>
  | Array<Value>
  // | ReadonlySet<Value> // Map extends Readonly Set , it's strange
  | Set<Value>
type ObjectLikeCollection<Value = any, Key = any> =
  | ReadonlyMap<Key, Value>
  | Map<Key, Value>
  // @ts-expect-error tedius key type string | symbol | number
  | Record<Key, Value>
  | {
      // @ts-expect-error tedius key type string | symbol | number
      [k in Key]: Value
    }

export type GetCollectionKey<C> = C extends ArrayLikeCollection
  ? number
  : C extends Collection<any, infer K>
  ? K
  : unknown

export type GetCollectionValue<C> = C extends ArrayLikeCollection<infer V>
  ? V
  : C extends ObjectLikeCollection<infer Value>
  ? Value
  : unknown

export type GetNewCollection<
  OldCollection,
  NewValue,
  NewKey = GetCollectionKey<OldCollection>
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

type A = GetCollectionValue<Map<string, number>>
type B = A
/** test */
// type V = GetCollectionKey<('hello' | number)[]>
// type F = GetCollectionKey<Record<'hello', number>>
// type G = GetCollectionKey<{ a: 1; b: 2 }>
// type H = GetCollectionKey<Map<string, number>>
// type V1 = GetCollectionValue<('hello' | number)[]>
// type F1 = GetCollectionValue<Record<'hello', number>>
// type G1 = GetCollectionValue<{ a: 1; b: 2 }>
