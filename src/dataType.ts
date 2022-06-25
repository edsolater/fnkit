import { SKeyof } from './typings'
import { AnyArr, AnyFn, Primitive, StringNumber } from './typings/constants'

/**
 * @requires {@link getObjType `getObjType()`}
 * @example
 * getType(null) // 'null'
 * getType(undefined) // 'undefined'
 * getType(true) // 'boolean'
 * getType(3) // 'number'
 * getType('xxx') // 'string'
 * getType(11n) // 'bigint'
 * getType(Symbol.for('hello')) // 'symbol'
 * getType([]) // 'Array'
 * getType(() => {}) // 'function'
 * getType(new Set()) // 'Set'
 * getType(new Map()) // 'Map'
 * getType(new WeakSet()) // 'WeakSet'
 * getType(new WeakMap()) // 'WeakMap'
 * getType({}) // 'Object'
 * getType(Object.create(null)) // 'Object'
 * getType(new Date()) // 'Date'
 */
export function getType(
  val: unknown
):
  | 'null'
  | 'undefined'
  | 'boolean'
  | 'number'
  | 'string'
  | 'bigint'
  | 'symbol'
  | 'function'
  | ReturnType<typeof getObjType>
  | 'unknown' {
  // @ts-ignore
  return isNull(val) ? 'null' : typeof val === 'object' ? getObjType(val) ?? 'unknown' : typeof val
}

export const getObjType = (obj: unknown): 'Array' | 'Object' | 'Set' | 'Map' | 'WeakSet' | 'WeakMap' | 'Date' => {
  const typeRawString = Object.prototype.toString.call(obj)
  const typeString = typeRawString.match(/object (?<t>\w+)/)?.groups?.['t']
  //@ts-ignore force
  return typeString
}

export function isArray(value: unknown): value is AnyArr {
  return Array.isArray(value)
}
export function isFunction(value: unknown): value is AnyFn {
  return typeof value === 'function'
}

export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set
}

export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map
}

export function isWeakSet(value: unknown): value is WeakSet<any> {
  return value instanceof WeakSet
}

export function isWeakMap(value: unknown): value is WeakMap<any, unknown> {
  return value instanceof WeakMap
}

/** value can't be array or function  */
export function isObject(val: unknown): val is Record<string | number | symbol, any> {
  return !(val === null) && typeof val === 'object'
}

export function isUndefined(val: unknown): val is undefined {
  return val === undefined
}

export function isRegExp(target: unknown): target is RegExp {
  return isObject(target) && target instanceof RegExp
}

export function isNumber(val: any): val is number {
  return typeof val === 'number'
}

export function isFinite(val: unknown): val is number {
  return Number.isFinite(val)
}
export const isTrueNumber = isFinite

export function isNaN(val: unknown): val is number {
  return Number.isNaN(val)
}

export function isBoolean(val: any): val is boolean {
  return typeof val === 'boolean'
}

/**
 * @example
 * isBigInt(2n) //=> true
 * isBigInt(Bigint(3)) //=> true
 * isBigInt('3') //=> false
 */
export function isBigInt(val: unknown): val is bigint {
  return typeof val === 'bigint'
}

export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

export function isIterable(val: unknown): val is Iterable<unknown> {
  return isObject(val) && typeof val[Symbol.iterator] === 'function'
}

export function isStringNumber(val: any): val is StringNumber {
  return isNumber(Number(val))
}

export function isJSON(jsonString: unknown): jsonString is string {
  if (typeof jsonString !== 'string') return false
  else {
    try {
      JSON.parse(jsonString)
      return true
    } catch (e) {
      return false
    }
  }
}

export function isEmpty(val: unknown): boolean {
  return isEmptyString(val) || isEmptyArray(val) || isEmptyObject(val)
}

export function isEmptyArray(val: unknown): boolean {
  return isArray(val) && val.length === 0
}

export function isEmptyObject(val: unknown): boolean {
  return isObjectLike(val) && Reflect.ownKeys(val).length === 0
}

export function isEmptyString(val: unknown): val is '' {
  return val === ''
}

export const isExist = notNullish

export function isFalse(val: unknown): val is false {
  return val === false
}

export function isFalsy(val: unknown) {
  return !isTruthy(val)
}

function isIndexNumber(n: any): boolean {
  return Number.isInteger(n) && n >= 0
}
export function isIndex(index: any, ofArr?: any[]): index is number {
  return isIndexNumber(index) && (isExist(ofArr) ? index < ofArr?.length : true)
}

export const isInterger = Number.isInteger

export function isKey(key: keyof any, ofObj?: object): key is keyof any {
  return isExist(ofObj) ? isExist(ofObj[key]) : isString(key) || isInterger(key) || isSymbol(key)
}

export function isNull(val: unknown): val is null {
  return val === null
}

export function isNullish(value: unknown): value is undefined | null {
  return !notNullish(value)
}

export function isObjectLikeOrFunction(val: any): val is object | AnyFn {
  return isObjectLike(val) || isFunction(val)
}

export function isObjectLike(val: unknown): val is object {
  return typeof val === 'object' && val !== null
}

export function isPrimitive(v: unknown): v is Primitive {
  return isBoolean(v) || isNumber(v) || isString(v)
}

export function isEmtyObject(obj: any): boolean {
  return (isArray(obj) && obj.length === 0) || (isObject(obj) && Object.keys(obj).length === 0)
}

export function isEmtyString(v: any): boolean {
  return v === ''
}

export function isSymbol(val: unknown): val is symbol {
  return getType(val) === 'symbol'
}

export function isTrue(val: unknown): val is true {
  return val === true
}

export function isTruthy(val1: unknown) {
  return Boolean(val1)
}

export const notDefined = isNullish

/**
 * @example
 * notEmptyObject({}) //=> false
 */
export function notEmptyObject(target: Record<string, any>): boolean {
  return Boolean(Object.keys(target).length)
}

export const notExist = isNullish

/**
 * @param value 被检测的值
 * @example
 * notNullish('') // true
 * notNullish(undefined) // false
 * notNullish([]) // true
 */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null
}

export function notUndefined<T>(val: T): val is T extends undefined ? never : T {
  return val !== undefined
}

/**
 * @example
 * notEmpty([]) // false
 * notEmpty([1]) // true
 */
export function notEmpty(target: any[] | string): boolean {
  return !isEmptyArray(target)
}
