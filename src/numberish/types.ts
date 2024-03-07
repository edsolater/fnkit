import { Primitive } from '../typings/constants'
import type { RPNItem } from './numberExpression'

export type StringNumber = string
export type MathematicalExpression = string
export type NoNullablePrimitive = NonNullable<Primitive>
export type Numberish = PureNumberish | { toNumberish: () => Numberish }

/** parsed some method that can switch a object to a numberish */
export type PureNumberish = BasicNumberish | MathematicalExpression | RPNItem[]

/** for readibility, have to be a `Percent` */
export type Percent = Numberish

/** for basic operations */
export type BasicNumberish = number | bigint | StringNumber | Fraction

/** value is numerator / (denominator * 10 ^ decimal) */
export type Fraction = {
  decimal?: number
  numerator: bigint
  /** default 1n */
  denominator?: bigint
}

/** for readibility */
export type BNNumberish = Numberish // Temp
/** for readibility */
export type BasicBNNumberish = number | bigint | StringNumber | Fraction // Temp
