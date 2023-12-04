import { NumberishOption } from '../numberish'

export type Primitive = boolean | number | string | bigint | symbol | null | undefined
export type StringNumber = string
export type NoNullablePrimitive = NonNullable<Primitive>
export type Numberish = number | string | bigint | NumberishAtom | NumberishAtomRaw
export type NumberishAtom = { toString: (options?: NumberishOption) => string } & Required<NumberishAtomRaw>
/** value is numerator / (denominator * 10 ^ decimal) */
export type NumberishAtomRaw = { decimal?: number; numerator: bigint; denominator?: bigint }
export type AnyFn = (...args: any[]) => any
export type AnyObj = Record<keyof any, any>
export type AnyArr = any[]
export type AnyMap = Map<any, any>
export type AnySet = Set<any>
export type NotFunctionValue = Exclude<any, AnyFn>
export type Nullish = undefined | null
export type Falsy = Nullish | false | 0 | ''
export type NonFalsy<T> = Exclude<T, Falsy>
export type ID = string | number
export type SessionID = ID
