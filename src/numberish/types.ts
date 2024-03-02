import { Primitive } from '../typings/constants'
import type { RPNItem } from './numberExpression'

export type StringNumber = string
export type MathematicalExpression = string
export type NoNullablePrimitive = NonNullable<Primitive>
export type Numberish = BasicNumberish | Fraction | { toNumberish: () => Numberish } | MathematicalExpression | RPNItem[]
/** parsed some method that can switch a object to a numberish */

export type PureNumberish = number | bigint | StringNumber | Fraction
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
