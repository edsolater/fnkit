import { isArray } from "../dataType"
import { setByPath, travelObject } from "./travelObject"

/**
 * only walk through string enumtable object key (not symbol)
 */
export function createFromObject(
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
    needDeepWalk(needGoDeep: boolean): void
  }) => any,
) {
  const object = isArray(obj) ? [...obj] : { ...obj }
  travelObject(obj, ({ keyPaths, parentPath, key, value, canDeepWalk, needDeepWalk }) => {
    const newValue = onTravelValue({ keyPaths, parentPath, key, value, canDeepWalk, needDeepWalk })
    if (newValue !== undefined && newValue !== value) {
      setByPath(object, keyPaths, newValue)
    }
  })
  return object
}
