import { isArray, isObjectLike, isObjectLiteral } from "../dataType"
/**
 * won't create a new object
 * only walk through string enumtable object key (not symbol)
 */
export function travelObject(
  obj: object,
  onTravelValue: (info: {
    key: keyof any
    /* path include self */
    keyPaths: (keyof any)[]
    /* path execpt self */
    parentPath: (keyof any)[]
    value: any
    /** when value is object or array, it's canDeepWalk */
    canDeepWalk: boolean
    /** only useful when canDeepWalk is true */
    needDeepWalk(needTo: boolean): void
  }) => void,
) {
  function walk(obj: object, parentKeyPaths: (keyof any)[] = []) {
    Object.entries(obj).forEach(([key, value]) => {
      const canDeepWalk = isObjectLiteral(value) || isArray(value) // by default, only objectLiteral|array can deep walk
      let needDeepWalk = canDeepWalk
      const keyPaths = parentKeyPaths.concat(key)
      onTravelValue({
        key,
        keyPaths,
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
 * if  path is not reachable, this will create a new literal object. see example for detail
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
      recursiveSet({ obj, path, value, mergeRule })
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
function recursiveSet({
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
    return recursiveSet({ obj: Reflect.get(obj, currentKey), path: restPath, value, mergeRule })
  } else {
    Reflect.set(obj, currentKey, recursiveSet({ obj: {}, path: restPath, value, mergeRule }))
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
