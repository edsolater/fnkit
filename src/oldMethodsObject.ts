import { flap } from './collectionMethods'
import { isObjectLike, isFunction, isObject } from './dataType'
import { AnyObj } from './typings/constants'
import { SKeyof, Valueof } from './typings/tools'

/** 给配置对象添加默认值 */
export function addDefault<T extends object, W extends Partial<T>>(initConfig: T, defaultConfig: W): T & W {
  return { ...defaultConfig, ...initConfig }
}

/**
 * 克隆对象
 * @todo 给这个函数写测试，而且也没考虑到数组的特殊性
 * @param inputObject
 * @returns
 */
export function deepCloneObject<O extends object>(inputObject: O): O {
  return Object.fromEntries(
    Object.entries(inputObject).map(([key, value]) => [key, isObjectLike(value) ? deepCloneObject(value) : value])
  ) as any
}

/**
 * 获取对象的项数
 * @param obj 目标对象
 * @example
 * getObjectSize({a:1, b:2}) // 2
 */
export function getObjectSize(obj: object) {
  return Object.getOwnPropertyNames(obj).length
}

/**
 * 插入新的项（返回新对象）
 */
export function appendEntries<T extends object, U extends keyof any, V>(
  obj: T,
  ...entries: ReadonlyArray<[key: U, value: V]>
): { [K in keyof T | U]: K extends keyof T ? T[K] : V } {
  //@ts-ignore
  return mergeObjects(obj, Object.fromEntries(entries))
}

export function flatMapObjectEntry<T>(
  target: T,
  flatMapper: (entry: [key: SKeyof<T>, value: Valueof<T>]) => any[]
): any {
  //@ts-ignore
  return Object.fromEntries(Object.entries(target ?? {}).flatMap(flatMapper)) as any
}

/**
 * @example
 * objectReduce({ a: 1, b: 2 }, (acc, [_, value]) => acc + value, 0) // 3
 */
export function reduceObjectEntry<T extends object, R>(
  obj: T,
  reducer: <U extends keyof T>(
    acc: R,
    currentEntry: [key: U, value: T[U]],
    index: number,
    allEntries: Array<[key: U, value: T[U]]>
  ) => R,
  initialValue: R
): R {
  //@ts-expect-error
  return Object.entries(obj).reduce(reducer, initialValue)
}

/**
 * @deprecated
 * inspire from Immer.js @see https://immerjs.github.io/immer/
 * @example
 * produce({ a: { b: 3 } }, (draft) => { draft.a.b = 4 }) //=> { a: { b: 4 }}
 *
 * const foo = {a: {b: 3}, c: {d:5}}
 * const foo2 = produce(foo, (d)=>{d.c.d = 6})
 * foo.a === foo2.a //=> true
 */
export function produce<O extends object>(target: O, producer: (darft: O) => void): O {
  const object = deepCloneObject(target)
  producer(object)
  return object
}

/**
 * 根据属性，分割对象（以划分成两部分的形式）
 * @param obj 目标对象
 * @param propNameList 属性列表
 * @example
 * splitObject({ a: 1, b: 2 }, ['a']) // [{ a: 1 }, { b: 2 }]
 */
export function groupObjectByKey<T extends AnyObj>(
  obj: T,
  judger: (key: keyof T, value: T[keyof T]) => boolean
): [Partial<T>, Partial<T>]
export function groupObjectByKey<T extends AnyObj, U extends keyof T>(
  obj: T,
  propNameList: ReadonlyArray<U>
): [Pick<T, U>, Omit<T, U>]
export function groupObjectByKey(obj, param2) {
  return reduceObjectEntry(
    obj,
    (acc, [key, value]) => {
      const groupNo = (isFunction(param2) ? param2(key, value) : param2.includes(key)) ? 0 : 1
      const targetBucket = acc[groupNo] as any
      targetBucket[key] = obj[key]
      return acc
    },
    [{}, {}]
  )
}

export function containKey<T extends string | number | symbol>(
  obj: unknown,
  ...keys: T[]
): obj is { [K in T]: unknown } {
  return isObject(obj) && flap(keys).every((key: string | number | symbol) => key in obj) // TODO: flap's type should be smarter
}

/**
 *  shallow clone like {...obj}, but don't access it's getter
 *  @example
 * cloneObject({get a() {return 1}}) //=> {get a() {return 1}}
 */
export function cloneObject<T extends AnyObj>(original: T): T {
  return new Proxy(
    {},
    {
      get: (target, key, receiver) =>
        key in target ? Reflect.get(target, key, receiver) : Reflect.get(original, key, receiver),
      has: (target, key) => key in target || key in original,
      set: (target, key, value) => Reflect.set(target, key, value),
      getPrototypeOf: () => Object.getPrototypeOf(original),
      ownKeys: (target) => Reflect.ownKeys(target).concat(Reflect.ownKeys(original)),
      // for Object.keys to filter
      getOwnPropertyDescriptor: (target, key) =>
        key in target ? Object.getOwnPropertyDescriptor(target, key) : Object.getOwnPropertyDescriptor(original, key)
    }
  ) as T
}
