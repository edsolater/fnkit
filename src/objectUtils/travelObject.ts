import { toCamelCase } from "../changeCase"
import { isArray, isObjectLiteral, isPrimitive, isPromise } from "../dataType"
import type { AnyObj } from "../typings"
import { getByPath, setByPath } from "./propertyUtils"

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
 * 【底层工具】已暴露能力为优雅，而不是。面向于接收。外界的。（如需声明式的工具函数，请使用 {@link changeObject}）
 * ！！！ 该函数只遍历可枚举属性
 *
 *
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

type ChangeRule = {
  when: (eachStepContext: Omit<ObjectTravelStepInfo, "needDeepWalk" | "canDeepWalk">) => boolean
  do?: (
    context: Omit<ObjectTravelStepInfo, "needDeepWalk" | "canDeepWalk"> & {
      replaceKey: <NewKey>(replaceFn: (key: any) => NewKey) => void
    },
  ) => void
}

/**
 * 遍历整个对象，
 * 声明式地替换满足条件的 entry 的 key 或 value
 * @param obj
 * @param rules
 * @returns
 */
export function changeObject(obj: AnyObj, rules: ChangeRule[]): AnyObj {
  const pendingMutations: (() => void)[] = []

  travelObject(obj, (context) => {
    for (const rule of rules) {
      if (rule.when(context)) {
        // if (rule.replaceValue) {
        //   const newValue = rule.replaceValue(value)
        //   setByPath({ obj: draft, path, value: newValue })
        // }
        // if (rule.replaceKey) {
        //   const newKey = rule.replaceKey(key)
        //   if (newKey !== key) {
        //     const parent = path.slice(0, -1).reduce((acc, key) => acc[key], draft)
        //     parent[newKey] = parent[key]
        //     delete parent[key]
        //   }
        // }
        // if (rule.needDeepWalk) {
        //   needDeepWalk(rule.needDeepWalk(value))
        // }
        rule.do?.({
          ...context,
          replaceKey: (replaceFn) => {
            const newKey = replaceFn(context.key)
            const currentKey = context.key

            // 获取目标的引用，而不是key地址。因为key会被改，但引用不变。
            const parentObj = context.parentPath.length === 0 ? obj : getByPath(obj, context.parentPath)

            // 房命名kid实际操作。
            const rename = () => {
              parentObj[newKey] = parentObj[currentKey]
              delete parentObj[currentKey]
            }

            pendingMutations.push(rename)
          },
        })
      }
    }
  })

  pendingMutations.forEach((mutation) => mutation())

  return obj
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
 * @example
 * toCamelCaseObject({
 *   "user_info":{"create_at":123}
 * }) // => {userInfo: {createAt:123}}
 */
export function toCamelCaseObject(oldObj: AnyObj): AnyObj {
  return changeObject(oldObj, [
    {
      when: ({ key }) => isPrimitive(key),
      do: ({ replaceKey }) => replaceKey((key) => toCamelCase(String(key))),
    },
  ])
}
