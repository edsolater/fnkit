import { Primitive } from '../typings/constants'

export type StringNumber = string
export type MathExpression = string
export type NoNullablePrimitive = NonNullable<Primitive>
export type Numberish =
  | number
  | bigint
  | StringNumber
  | MathExpression
  | NumberishAtom
  | Fraction
  | { toNumberish: () => Numberish }
/** parsed some method that can switch a object to a numberish */

export type PureNumberish = number | bigint | StringNumber | Fraction
/** for readibility, have to be a `Percent` */

export type Percent = Numberish
/** for basic operations */

export type BasicNumberish = number | bigint | StringNumber | Fraction

export type NumberishAction = {
  type:
    | 'add' /* basicAdd */
    | 'minus' /* basicMinus */
    | 'multiply' /* basicMul */
    | 'divide' /* basicDivide */
    | 'pow' /* basicPow */
    | 'reciprocal' /* basicReciprocal */
  numberishB?: Numberish
}
export type NumberishAtom = {
  decimal?: number
  numerator: bigint
  denominator?: bigint
  /** RPN-like */
  carriedOperations?: NumberishAction[]
}
/** value is numerator / (denominator * 10 ^ decimal) */

export type Fraction = {
  decimal?: number
  numerator: bigint
  denominator: bigint
}
