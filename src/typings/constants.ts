export type Primitive = boolean | number | string | bigint | symbol | null | undefined
export type Booleanable = Primitive | Object | null | undefined
// just for readability
export type Int<Min = number, Max = number> = number
// just for readability
export type Float<Min = number, Max = number> = number
export type AnyFn = (...args: any[]) => any
export type AnyObj = Record<keyof any, any>
export type AnyArr = any[]
export type AnyMap = Map<any, any>
export type AnySet = Set<any>
export type NotFunctionValue = Exclude<any, AnyFn>
export type Nullish = undefined | null
export type Falsy = Nullish | false | 0 | ""
export type NonFalsy<T> = Exclude<T, Falsy>
export type ID = string | number
export type IDNumber = number
export type SessionID = ID
