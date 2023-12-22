import { NumberishOption } from '../numberish'

export type Primitive = boolean | number | string | bigint | symbol | null | undefined
export type StringNumber = string
export type MathExpression = string
export type NoNullablePrimitive = NonNullable<Primitive>
export type Numberish =
  | number
  | bigint
  | StringNumber
  // | MathExpression
  | NumberishAtom
  | Omit<NumberishAtomRaw, 'denominator' | 'decimal'>
  | { toNumberish: () => Numberish }

/** for basic operations */
export type BasicNumberish =
  | number
  | bigint
  | StringNumber
  | NumberishAtom
  | Omit<NumberishAtomRaw, 'denominator' | 'decimal'>
  | { toNumberish: () => Numberish }

type NumberishAction = {
  operator: '+' /* basicAdd */ | '-' /* basicMinus */ | '*' /* basicMul */ | '/' /* basicDivide */ | '^' /* basicPow */
  tokenB: Numberish
}
export type NumberishAtom = {
  decimal: number
  numerator: bigint
  denominator: bigint
  /** RPN-like */
  cachedOperations: NumberishAction[]
  toString: (options?: NumberishOption) => string
}

/** value is numerator / (denominator * 10 ^ decimal) */
export type NumberishAtomRaw = {
  decimal: number
  numerator: bigint
  denominator: bigint
}
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
