export type Primitive = boolean | number | string | bigint | symbol | null | undefined
export type PresentPrimitive = NonNullable<Primitive>
export type AnyValue = Primitive | AnyArr | AnyRecord | AnyMap | AnySet
export type Nullish = undefined | null
export type Falsy = Nullish | false | 0 | ""
export type NonFalsy<T> = Exclude<T, Falsy>
type StringableObject = {
  toString(): string
}

export type Stringable = Primitive | StringableObject
export type Booleanable = Primitive | Object

// just for readability
export type Int<Min = number, Max = number> = number
// just for readability
export type Float<Min = number, Max = number> = number

// ========= 可描述，可想象的string =========
export type Src = string
export type Url = string
export type Href = string
export type ID = string | number
export type IDNumber = number
export type SessionID = ID

// ========= 可object =========
export type AnyFn = (...args: any[]) => any
export type NotFunctionValue = Primitive | AnyArr | AnyRecord | AnyMap | AnySet
export type NonFunction<T> = T extends AnyFn ? never : T

/**
 * @deprecated 太泛, 推荐使用带有结构表达的 AnyRecord 代替
 */
export type AnyObj = Record<keyof any, any>
export type AnyRecord = Record<keyof any, unknown> & // 必须是一个可索引 record。
  Record<keyof any, any> // 读属性时是 any。
export type AnyClass<T = any> = new (...args: any[]) => T
export type AnyArr = any[]
export type AnyMap = Map<any, any>
export type AnySet = Set<any>

