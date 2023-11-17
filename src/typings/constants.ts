/*******************************
 *
 * 有些类型声明看着冗余，但这是写更可读的代码所必须的
 *
 ******************************/

import { NumberishOption } from '../numberish'

export type Primitive = boolean | number | string | bigint | symbol | null | undefined  
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

/**
 * 移动距离
 */
export type Delta2dTranslate = {
  // 水平移动距离
  dx: number
  // 竖直移动距离
  dy: number
}

/**
 * 水平、垂直同步放大
 */
export type Delta2dScale = {
  // 水平放大倍数
  scaleRate: number
}

/**
 * 纯向量
 */
export type Vector = {
  // 向量x
  x: number
  // 向量y
  y: number
}

/**
 * 表示速度的向量
 */
export type SpeedVector = Vector

/**
 * 物体坐标
 */
export type Location2d = {
  // 横坐标
  x: number
  // 纵坐标
  y: number
}

/**
 * 2d变换量
 */
export type Delta2d = Delta2dTranslate & Delta2dScale

/**
 * 就是常见的ID
 */
export type ID = string | number
/**
 * 就是常见的ID
 */
export type SessionID = ID
/**
 * 就是常见的url
 */
export type URL = string

/**
 * 2个方向
 */
export type Direction = 'x' | 'y'

/**
 * 3个方向
 */
export type Direction3D = 'x' | 'y' | 'z'

/**
 * 对应event都有的timeStamp
 */
export type Timestamp = number

export type StringNumber = string
