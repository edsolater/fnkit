import { Collection } from '../collectionMethods'
import { AnyFn, Falsy } from './constants'

export type MayArray<T> = T | Array<T>
/** flap */
export type DeMayArray<T> = T extends any[] ? T[number] : T

export type MayFn<T, Params extends any[] = any[]> = T | ((...params: Params) => T)
export type DeMayFn<T extends MayFn<any>> = T extends (...args: any[]) => infer R ? R : T
export type MayParameter<T> = AnyFn extends T ? Parameters<Extract<T, AnyFn>> : any[]

export type Wrap<T, Params extends any[] = any[]> = MayArray<MayFn<T, Params>>
export type DeWrap<T extends MayArray<MayFn<any>>> = DeMayFn<DeMayArray<T>>

export type MayDeepArray<T> = T | Array<MayDeepArray<T>>
export type DeMayDeepArray<T> = T extends MayDeepArray<infer U> // can't recursively unwrap a recursively wrapped value , so have to handle special case first
  ? U
  : T extends Array<any>
  ? DeMayDeepArray<T[number]>
  : T

export type MayObj<T, KeyName extends string = 'defaultKey'> = T | { [key in KeyName]: T }
export type DeMayObj<T extends MayObj<any>> = T extends Record<string, any> ? T[keyof T] : T
export type MayObjKey<T extends MayObj<any>> = T extends Primitive ? never : T extends Record<infer R, any> ? R : never

/**
 * 能有enum提示，同时，传入其他string也不报错
 * @example
 * const e = MayEnum<'hello'|'world'> // 'hello' | 'world' | (string & {})
 */
export type MayEnum<T> = T | (string & {})

export type MayPromise<T> = T | Promise<Awaited<T>>
/**
 * type I = GetRequired<{ foo: number, bar?: string }> // expected to be { foo: number }
 */
// type GetRequired<T> = { [P in keyof T as T[P] extends Required<T>[P] ? P : never]: T[P] };

/**
 * get all property names with filter
 * @example
 * Properties<{a: number, b: true, c(): boolean}> // 'a' | 'b'
 */
export type PickKeys<O, AssertType, K = keyof O> = K extends keyof O ? (O[K] extends AssertType ? K : never) : never

/**
 * get all method names
 * @example
 * MethodKeys<{a: number, b: true, c(): boolean}> // 'c'
 */
export type PickMethodKeys<O> = PickKeys<O, AnyFn>

/**
 * get all pure property names
 * @example
 * PropertyKeys<{a: number, b: true, c(): boolean}> // 'a' | 'b'
 */
export type PickPropertyKeys<O> = Exclude<keyof O, PickMethodKeys<O>>

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: undefined }
/**
 * 两个类型互斥（只能二选一）
 * @example
 * type F = XOR<{ d: '2' }, { a: 1; b: true; c(): boolean }>
 * const d: F = { a: 1, b: true, c: () => true } // OK
 * const d: F = { d: '2' } // OK
 * const d: F = { a: 1, b: true, c: () => true, d: '2' } // Error
 */
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U

/**
 * 只选取满足条件的属性名
 * @example
 * PickByValue<{a: boolean, b: boolean, c: string}, boolean> // {a: boolean, b: boolean}
 */
export type PickByValue<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never
}[keyof T]

/**
 * 只选取不满足条件的属性名
 * @example
 * OmitByValue<{a: undefined, b: undefined, c: string}, undefined> // {c: string}
 */
export type OmitByValue<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P
}[keyof T]

/**
 * 删除 属性值为undefined的属性
 * @example
 * NotUndefinedValue<{a: number, b: never}> // {a: number}
 */
export type NotUndefinedValue<O> = {
  [Q in OmitByValue<O, undefined>]: O[Q]
}

/**
 * @example
 * ExtractProperty<{ key: 'hello' }, 'key'> // "hello"
 */
export type ExtractProperty<O, P extends keyof any, Fallback extends keyof any = any> = O extends {
  [Key in P]: infer K
}
  ? K extends any
    ? K
    : Fallback
  : Fallback

//#region ------------------- word case -------------------
/**
 * @example
 * PascalCaseFromKebabCase<'hello-world'> // 'HelloWrold'
 * PascalCaseFromKebabCase<'hello-world-hi'> // 'HelloWroldHi'
 * PascalCaseFromKebabCase<'hello-world-hi-i'> // 'HelloWroldHiI'
 * PascalCaseFromKebabCase<'hello-world-hi-I-am'> // 'HelloWroldHiIAm'
 * PascalCaseFromKebabCase<'hello-world-hi-I-am-Ed'> // 'HelloWroldHiIAmEd'
 */
export type PascalCaseFromKebabCase<S extends string> =
  S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}-${infer p7}`
    ? `${Capitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}${Capitalize<p6>}${Capitalize<p7>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}`
    ? `${Capitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}${Capitalize<p6>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}`
    ? `${Capitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}`
    ? `${Capitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}`
    ? `${Capitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}`
    : S extends `${infer p1}-${infer p2}`
    ? `${Capitalize<p1>}${Capitalize<p2>}`
    : S

/**
 * @example
 * PascalCaseFromCamelCase<'helloWorld'> // 'HelloWrold'
 */
export type PascalCaseFromCamelCase<S extends string> = Capitalize<S>

/**
 * @example
 * PascalCase<'helloWorld'> // 'HelloWrold'
 * PascalCase<'helloWorldHi'> // 'HelloWroldHi'
 * PascalCase<'hello-world'> // 'HelloWrold'
 * PascalCase<'hello-world-hi'> // 'HelloWroldHi'
 * PascalCase<'hello-world-hi-i'> // 'HelloWroldHiI'
 * PascalCase<'hello-world-hi-I-am'> // 'HelloWroldHiIAm'
 * PascalCase<'hello-world-hi-I-am-Ed'> // 'HelloWroldHiIAmEd'
 */
export type PascalCase<S extends string> = PascalCaseFromKebabCase<Capitalize<S>>

/**
 * @example
 * PascalCaseFromKebabCase<'hello-world'> // 'helloWrold'
 * PascalCaseFromKebabCase<'hello-world-hi'> // 'helloWroldHi'
 * PascalCaseFromKebabCase<'hello-world-hi-i'> // 'helloWroldHiI'
 * PascalCaseFromKebabCase<'hello-world-hi-I-am'> // 'helloWroldHiIAm'
 * PascalCaseFromKebabCase<'hello-world-hi-I-am-Ed'> // 'helloWroldHiIAmEd'
 */
export type CamelCaseFromKebabCase<S extends string> =
  S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}-${infer p7}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}${Capitalize<p6>}${Capitalize<p7>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}${Capitalize<p6>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}${Capitalize<p5>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}${Capitalize<p4>}`
    : S extends `${infer p1}-${infer p2}-${infer p3}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}${Capitalize<p3>}`
    : S extends `${infer p1}-${infer p2}`
    ? `${Uncapitalize<p1>}${Capitalize<p2>}`
    : S

/**
 * @example
 * CamelCaseFromPascalCase<'HelloWorld'> // 'helloWrold'
 */
export type CamelCaseFromPascalCase<S extends string> = Uncapitalize<S>

/**
 * @example
 * CamelCase<'helloWorld'> // 'HelloWrold'
 * CamelCase<'helloWorldHi'> // 'HelloWroldHi'
 * CamelCase<'hello-world'> // 'HelloWrold'
 * CamelCase<'hello-world-hi'> // 'HelloWroldHi'
 * CamelCase<'hello-world-hi-i'> // 'HelloWroldHiI'
 * CamelCase<'hello-world-hi-I-am'> // 'HelloWroldHiIAm'
 * CamelCase<'hello-world-hi-I-am-Ed'> // 'HelloWroldHiIAmEd'
 */
export type CamelCase<S extends string> = CamelCaseFromKebabCase<Uncapitalize<S>>

/**
 * !!! only support kebab-case => snake_case yet!!!
 */
export type SnakeCase<S extends string> =
  S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}-${infer p7}`
    ? `${p1}_${p2}_${p3}_${p4}_${p5}_${p6}_${p7}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}-${infer p6}`
    ? `${p1}_${p2}_${p3}_${p4}_${p5}_${p6}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}-${infer p5}`
    ? `${p1}_${p2}_${p3}_${p4}_${p5}`
    : S extends `${infer p1}-${infer p2}-${infer p3}-${infer p4}`
    ? `${p1}_${p2}_${p3}_${p4}`
    : S extends `${infer p1}-${infer p2}-${infer p3}`
    ? `${p1}_${p2}_${p3}`
    : S extends `${infer p1}-${infer p2}`
    ? `${p1}_${p2}`
    : S
//#endregion

//#region ------------------- keyof / valueof -------------------
export type Keyof<O> = O extends Collection<infer K> ? K : unknown
export type Valueof<O> = O extends Collection<infer V> ? V : unknown
/**
 * extract only string
 */
export type SKeyof<O> = Keyof<O> & string

//#endregion

type Primitive = boolean | number | string | null | undefined

/**
 *
 * @example
 * interface A {
 *   keyA: string;
 *   keyB: string;
 *   map: {
 *     hello: string;
 *     i: number;
 *   };
 *   list: (string | number)[];
 *   keyC: number;
 * }
 *
 * type WrappedA = ReplaceType<A, string, boolean> // {
 *   keyA: boolean;
 *   keyB: boolean;
 *   map: {
 *     hello: boolean;
 *     i: number;
 *   };
 *   list: (number | boolean)[];
 *   keyC: number;
 * }
 */
export type ReplaceType<Old, From, To> = {
  [T in keyof Old]: Old[T] extends From // to avoid case: Old[T] is an Object,
    ? Exclude<Old[T], From> | To // when match,  directly replace
    : Old[T] extends Primitive // judge whether need recursively replace
    ? From extends Old[T] // it's an Object
      ? Exclude<Old[T], From> | To // directly replace
      : Old[T] // stay same
    : ReplaceType<Old[T], From, To> // recursively replace
}
/**
 * @see https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir
 * @see https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
 */
export type TypeEquals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type WritableKeys<T> = {
  [P in keyof T]: TypeEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }> extends true ? P : never
}[keyof T]
export type ReadonlyKeys<T> = {
  [P in keyof T]: TypeEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }> extends true ? never : P
}[keyof T]
export type OnlyWritable<T> = Pick<T, WritableKeys<T>>
export type OnlyReadonly<T> = Pick<T, ReadonlyKeys<T>>

export type NeverKeys<O> = { [K in keyof O]: O[K] extends never ? K : never }[keyof O]
export type UndefinedKeys<O> = { [K in keyof O]: O[K] extends undefined ? K : never }[keyof O]
export type NullKeys<O> = { [K in keyof O]: O[K] extends null ? K : never }[keyof O]
export type NilKeys<O> = NullKeys<O> | UndefinedKeys<O>
export type FalsyKeys<O> = { [K in keyof O]: O[K] extends Falsy ? K : never }[keyof O]

export type ShakeNever<O> = Omit<O, NeverKeys<O>>
export type ShakeUndefined<O> = Omit<O, UndefinedKeys<O>>
export type ShakeNull<O> = Omit<O, NullKeys<O>>
export type ShakeNil<O> = Omit<O, NilKeys<O>>
export type ShakeFalsy<O> = Omit<O, FalsyKeys<O>>

export type GetValue<T, K> = K extends keyof T ? T[K] : undefined
/**
 * @example
 * type A = { a: number; b: string; c?: string }
 * type B = { a: string; c: string; d?: boolean }
 *
 * type D = SOR<A, B> // { a: number | string; b: string | undefined; c: string | undefined; d: boolean | undefined } // ! if use SOR, you lost union type guard feature, try NOT to use this trick
 */
export type SOR<T, U> = { [K in keyof T | keyof U]: GetValue<T, K> | GetValue<U, K> }

export type Fallback<T, FallbackT> = T extends undefined ? FallbackT : T

/**
 * @example
 * type A = { a: number; b: string; c?: string }
 * type B = { a: string; c: string; d?: boolean }
 *
 * type D = Cover<A, B> // { a: string; b: string; c: string; d?: boolean}
 */
export type Cover<O, T> = { [K in keyof O | keyof T]: Fallback<GetValue<T, K>, GetValue<O, K>> }

export type UnionCover<O, T> = T extends T ? Cover<O, T> : never

/**
 * @example
 * ListAccess<[{ id: 'hello' }, { id: 3 }], 'id'> => ["hello", 3]
 */
export type ListAccess<Arr extends object[], Property extends keyof Arr[number]> = {
  [P in keyof Arr]: Arr[P][Property]
}

export type FromPrivateString<S extends string> = S extends `${infer U extends number}`
  ? U
  : S extends `${infer U extends bigint}`
  ? U
  : S extends `${infer U extends boolean}`
  ? U
  : S

export type Optional<O extends object, K extends keyof O = keyof O> = Omit<O, K> & Partial<Pick<O, K>>

export type AddDefaultProperties<T extends object, D extends object> = {
  [K in keyof T]: K extends keyof D ? NonNullable<T[K]> : T[K]
} & {
  [K in keyof D]: K extends keyof T ? NonNullable<T[K]> : D[K]
}
