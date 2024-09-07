import { isArray } from "../dataType"
import { setByPath, travelObject } from "./travelObject"

/**
 * only walk through string enumtable object key (not symbol)
 */
export function createObjectFrom(
  obj: object,
  onTravelValue: (info: {
    key: keyof any
    /* path include self */
    path: (keyof any)[]
    /* path execpt self */
    parentPath: (keyof any)[]
    value: any
    /** when value is object or array, it's canDeepWalk */
    canDeepWalk: boolean
    /** only useful when canDeepWalk is true */
    needDeepWalk(needGoDeep: boolean): void
  }) => any,
): any {
  const object = isArray(obj) ? [] : {}
  travelObject(obj, ({ path, parentPath, key, value, canDeepWalk, needDeepWalk }) => {
    const newValue = onTravelValue({ path, parentPath, key, value, canDeepWalk, needDeepWalk })
    if (newValue !== undefined && newValue !== value) {
      setByPath({ obj: object, path: path, value: newValue })
    } else {
      setByPath({ obj: object, path: path, value: value })
    }
  })
  return object
}
