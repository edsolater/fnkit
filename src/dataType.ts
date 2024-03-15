import { AnyArr, AnyFn, Primitive } from "./typings/constants"

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
  v: unknown,
):
  | "null"
  | "undefined"
  | "boolean"
  | "number"
  | "string"
  | "bigint"
  | "symbol"
  | "function"
  | ReturnType<typeof getObjType>
  | "unknown" {
  // @ts-ignore
  return isNull(v)
    ? "null"
    : isArray(v)
      ? "Array"
      : isFunction(v)
        ? "function"
        : isSet(v)
          ? "Set"
          : isMap(v)
            ? "Map"
            : typeof v === "object"
              ? getObjType(v) ?? "unknown"
              : typeof v
}

export const getObjType = (obj: unknown): "Array" | "Object" | "Set" | "Map" | "WeakSet" | "WeakMap" | "Date" => {
  const typeRawString = Object.prototype.toString.call(obj)
  const typeString = typeRawString.match(/object (?<t>\w+)/)?.groups?.["t"]
  //@ts-ignore force
  return typeString
}

export function isArray(v: unknown): v is AnyArr {
  return Array.isArray(v)
}

export function isMeanfulArray(v: unknown): v is AnyArr {
  return isArray(v) && v.length > 0
}

export function isFunction(v: unknown): v is AnyFn {
  return typeof v === "function"
}

export function isSet(v: unknown): v is Set<unknown> {
  return v instanceof Set
}

export function isMap(v: unknown): v is Map<unknown, unknown> {
  return v instanceof Map
}

export function isWeakSet(v: unknown): v is WeakSet<any> {
  return v instanceof WeakSet
}

export function isWeakMap(v: unknown): v is WeakMap<any, unknown> {
  return v instanceof WeakMap
}

/**
 * v can't be function, if need so, should use {@link isObjectLike}
 * v may both be object or array
 */
export function isObject(v: unknown): v is object {
  return !(v === null) && typeof v === "object"
}

export function isObjectLiteral(v: unknown): v is object {
  return isObject(v) && Object.getPrototypeOf(v) === Object.prototype
}

export function isUndefined(v: unknown): v is undefined {
  return v === undefined
}

export function isRegExp(target: unknown): target is RegExp {
  return isObject(target) && target instanceof RegExp
}

export function isPromise(target: unknown): target is Promise<unknown> {
  return isObject(target) && target instanceof Promise
}

/** It is impossible to detect if something is a Proxy according to the JS language specification. */
// export function isProxy(target: unknown): target is object {
//   return isObject(target) && target instanceof Proxy
// }

export function isNumber(v: any): v is number {
  return typeof v === "number" && !Number.isNaN(v)
}

export function isFinite(v: unknown): v is number {
  return Number.isFinite(v)
}
export const isTrueNumber = isFinite

export function isNaN(v: unknown): v is number {
  return Number.isNaN(v)
}

export function isBoolean(v: any): v is boolean {
  return typeof v === "boolean"
}

/**
 * @example
 * isBigInt(2n) //=> true
 * isBigInt(Bigint(3)) //=> true
 * isBigInt('3') //=> false
 */
export function isBigInt(v: unknown): v is bigint {
  return typeof v === "bigint"
}

export function isString(v: unknown): v is string {
  return typeof v === "string"
}

export function isIterable(v: unknown): v is Iterable<unknown> {
  return isObject(v) && typeof v[Symbol.iterator] === "function"
}

export function isAsyncIterable(v: unknown): v is AsyncIterable<unknown> {
  return isObject(v) && typeof v[Symbol.asyncIterator] === "function"
}

export function isDate(v: unknown): v is Date {
  return v instanceof Date
}

export function isJSON(jsonString: unknown): jsonString is string {
  if (typeof jsonString !== "string") return false
  else {
    try {
      JSON.parse(jsonString)
      return true
    } catch (e) {
      return false
    }
  }
}

export function isEmpty(v: unknown): boolean {
  return isEmptyString(v) || isEmptyArray(v) || isEmptyObject(v)
}

export function isEmptyArray(v: unknown): boolean {
  return isArray(v) && v.length === 0
}

export function isEmptyObject(v: unknown): boolean {
  return isObjectLike(v) && Reflect.ownKeys(v).length === 0
}

export function isEmptyString(v: unknown): v is "" {
  return v === ""
}

export const isExist = notNullish

export function isFalse(v: unknown): v is false {
  return v === false
}

export function isFalsy(v: unknown) {
  return !isTruthy(v)
}

export function isIndexNumber(n: any): boolean {
  return Number.isInteger(n) && n >= 0
}
export function isIndex(index: any, ofArr?: any[]): index is number {
  return isIndexNumber(index) && (isExist(ofArr) ? index < ofArr?.length : true)
}

export const isInterger = Number.isInteger

export function isKey(key: keyof any, ofObj?: object): key is keyof any {
  return isExist(ofObj) ? isExist(ofObj[key]) : isString(key) || isInterger(key) || isSymbol(key)
}

export function isNull(v: unknown): v is null {
  return v === null
}

export function isNullish(v: unknown): v is undefined | null {
  return !notNullish(v)
}

/** v can be array | object | function  */
export function isObjectLike(v: unknown): v is object | AnyFn {
  return isObject(v) || isFunction(v)
}

export const notPrimitive = isObjectLike

export function isPrimitive(v: unknown): v is Primitive {
  return isBoolean(v) || isNumber(v) || isBigInt(v) || isString(v) || isSymbol(v) || isNullish(v)
}

/** primitive without symbol or null or undefined */
export function isValuablePrimitive(v: unknown): v is boolean | number | string | bigint {
  return isBoolean(v) || isNumber(v) || isBigInt(v) || isString(v)
}

export function isEmtyObject(obj: any): boolean {
  return (isArray(obj) && obj.length === 0) || (isObject(obj) && Object.getOwnPropertyNames(obj).length === 0)
}

export function isEmtyString(v: any): boolean {
  return v === ""
}

export function isSymbol(v: unknown): v is symbol {
  return typeof v === "symbol"
}

export function isTrue(v: unknown): v is true {
  return v === true
}

export function isTruthy(v1: unknown) {
  return Boolean(v1)
}

export const notDefined = isNullish

/**
 * @example
 * notEmptyObject({}) //=> false
 */
export function notEmptyObject(target: Record<string, any>): boolean {
  return Boolean(Reflect.ownKeys(target).length)
}

export const notExist = isNullish

/**
 * @param v to be checked
 * @example
 * notNullish('') // true
 * notNullish(undefined) // false
 * notNullish([]) // true
 */
export function notNullish<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null
}

export function notUndefined<T>(v: T): v is T extends undefined ? never : T {
  return v !== undefined
}

/**
 * @example
 * notEmpty([]) // false
 * notEmpty([1]) // true
 */
export function notEmpty(target: any[] | string): boolean {
  return !isEmptyArray(target)
}
