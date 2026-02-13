import { isObjectLike } from "../dataType"

/**
 *
 * return first non-objectlike value
 * @param obj must be a objectlike value
 * @param path ['a','b','c']
 * @returns obj?.a?.b?.c
 */

export function getByPath(obj: object, path: (keyof any)[]): any {
  let current = obj
  for (const pathItem of path) {
    current = Reflect.get(current, pathItem)
    if (!isObjectLike(current)) break
  }
  return current
}
/**
 *
 * mutate object by path
 * if  path is not reachable, this will create a new literal object. see example for detail
 * 注意，它一视同仁地将所有不可达路径都创建为普通对象（Object Literal），而不是数组或其他复杂类型。
 * @param obj
 * @param path
 * @param value
 * @returns
 * @example
 * const obj = {a:{b:{c:1}}}
 * setByPath(obj,['a','b','c'],2) // obj.a.b.c === 2
 * setByPath(obj,['a','newKey','d'],2) // obj --> {a: {b: {c: 1}, newKey: {d: 2}}}
 */

export function setByPath({
  obj,
  path,
  value,
  mergeRule = () => value,
}: {
  obj: object
  path: (keyof any)[]
  value: any
  mergeRule?: (prev: any, input: any) => any
}): boolean {
  if (path.length === 0) return false
  if (path.length === 1) {
    const key = path[0]
    //TODO: this can use immer.produce to handle Reflect change
    return Reflect.set(obj, key, value)
  } else {
    try {
      forceSet({ obj, path, value, mergeRule })
      return true
    } catch {
      return false
    }
  }
}
/**
 *
 * even not reachable will be ok
 * used in {@link setByPath}
 */
function forceSet({
  obj,
  path,
  value,
  mergeRule,
}: {
  obj: object
  path: (keyof any)[]
  value: any
  mergeRule: (prev: any, input: any) => any
}): object {
  if (!isObjectLike(obj)) return obj
  if (path.length === 0) return obj
  if (path.length === 1) {
    const key = path[0]
    const prevValue = Reflect.get(obj, key)
    const mergedValue = mergeRule(prevValue, value)
    //TODO: this can use immer.produce to handle Reflect change
    Reflect.set(obj, key, mergedValue)
    return obj
  }
  const [currentKey, ...restPath] = path
  if (currentKey in obj) {
    return forceSet({ obj: Reflect.get(obj, currentKey), path: restPath, value, mergeRule })
  } else {
    Reflect.set(obj, currentKey, forceSet({ obj: {}, path: restPath, value, mergeRule }))
    return obj
  }
}

export function hasByPath(obj: object, path: (keyof any)[]): boolean {
  const lastKey = path.pop()
  if (!lastKey) return false
  const targetObj = getByPath(obj, path)
  if (!isObjectLike(targetObj)) return false
  return Reflect.has(targetObj, lastKey)
}
