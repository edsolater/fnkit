import { toCamelCase } from "../changeCase"
import { isArray, isObject, isObjectLiteral, isPromise, isString } from "../dataType"
import type { AnyObj } from "../typings"
import { setByPath } from "./propertyUtils"

type ObjectTravelStepInfo = {
  key: keyof any
  /** path include self */
  path: (keyof any)[]
  /** path execpt self */
  parentPath: (keyof any)[]
  value: any
  /** when value is object or array, it's canDeepWalk */
  canDeepWalk: boolean
  /** only useful when canDeepWalk is true */
  needDeepWalk(needTo: boolean): void
}

/**
 * 【底层工具】已暴露能力为优雅，而不是。面向于接收。外界的。（如需面向外界的工具函数使用）
 * won't create a new object
 * only walk through string enumtable object key (not symbol)
 */
export function travelObject(obj: object, onTravelValue: (info: ObjectTravelStepInfo) => void) {
  function walk(obj: object, parentKeyPaths: (keyof any)[] = []) {
    Object.entries(obj).forEach(([key, value]) => {
      const canDeepWalk = isObjectLiteral(value) || isArray(value) // by default, only objectLiteral|array can deep walk
      let needDeepWalk = canDeepWalk
      const keyPaths = parentKeyPaths.concat(key)
      onTravelValue({
        key,
        path: keyPaths,
        parentPath: parentKeyPaths,
        value,
        canDeepWalk,
        needDeepWalk(needTo: boolean) {
          needDeepWalk = needTo
        },
      })
      if (needDeepWalk) {
        walk(value, keyPaths) // go deep
      }
    })
  }
  walk(obj)
}

// TODO: 还没有实现。应该要跟immer结合。
export function immutablyChangeObject(
  oirginalObject: AnyObj,
  changeFn: (value: any, path: (keyof any)[]) => any,
): AnyObj {
  const newObject = {}
  travelObject(oirginalObject, ({ value, path }) => {})
  return newObject
}

// TODO: 也还没有实现。应该要跟immer结合。
export function lazyDo<T>(base: T, doSomething: (draft: T) => void): T
export function lazyDo<T, U>(base: T, doSomething: (draft: T) => U): U
export function lazyDo<T>(base: T, doSomething: (draft: T) => void): T {
  throw new Error("lazyDo is not implemented yet, you can use immer.produce instead")
}

/**
 * async version of {@link createObjectWithRules}
 */
export async function asyncMutatableChangeObjectWithRules(
  resourceObject: AnyObj,
  rules: [match: (data: any) => boolean, replaceTo: (data: any) => any | Promise<any>][],
): Promise<AnyObj> {
  const promises: Promise<any>[] = []
  const newObject = {}
  travelObject(resourceObject, ({ value, path }) => {
    for (const [match, replaceTo] of rules) {
      if (match(value)) {
        const newValue = replaceTo(value)
        if (isPromise(newValue)) {
          promises.push(newValue.then((v) => setByPath({ obj: newObject, path: path, value: v })))
        } else {
          setByPath({ obj: newObject, path: path, value: newValue })
        }
      }
    }
  })
  return Promise.all(promises).then(() => newObject)
}

/**
 *
 * sync version of {@link asyncMutatableChangeObjectWithRules}
 * 其实就是换值。
 */
export function createObjectWithRules(
  resourceObject: AnyObj,
  rules: [
    match: (step: Omit<ObjectTravelStepInfo, "needDeepWalk" | "canDeepWalk">) => boolean,
    rule: (step: Omit<ObjectTravelStepInfo, "needDeepWalk" | "canDeepWalk">) => any,
  ][],
): AnyObj {
  const newObject = {}
  travelObject(resourceObject, (info) => {
    if (!info.canDeepWalk) {
      for (const [match, rule] of rules) {
        if (match(info)) {
          const newValue = rule(info)
          setByPath({ obj: newObject, path: info.path, value: newValue })
        } else {
          setByPath({ obj: newObject, path: info.path, value: info.value })
        }
      }
    }
  })
  return newObject
}

/**
 *
 * @example
 * toCamelCaseObject({
 *   "user_info":{"create_at":123}
 * }) // => {userInfo: {createAt:123}}
 */
export function toCamelCaseObject(oldObj: AnyObj): AnyObj {
  const newObj: AnyObj = {}
  travelObject(oldObj, ({ value, path, canDeepWalk }) => {
    if (isArray(value)) {
      // 手动创建，不然自动创建一定是空对象。
      setByPath({ obj: newObj, path: path.map((k) => (isString(k) ? toCamelCase(k) : k)), value: [] })
    }
    if (!canDeepWalk)
      setByPath({ obj: newObj, path: path.map((k) => (isString(k) ? toCamelCase(k) : k)), value: value })
  })
  return newObj
}
