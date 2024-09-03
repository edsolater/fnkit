import { isObject } from "./dataType"

/**
 * a useful helper function to deal with promise default value.
 *
 * mainly for ui structure like:solidjs to get default value from unsolved promise
 */
export function getPromiseDefault<P extends Promise<any>>(
  promise: P | undefined,
): P extends { default: unknown } ? P["default"] : undefined {
  if (!isObject(promise)) {
    throw new Error("promise is not an object, strange🤔, input:", promise)
  }
  // @ts-expect-error no need to check
  return promise?.default
}
/**
 * !!MUTATELY
 *
 * a useful helper function to deal with promise default value.
 *
 * mainly for ui structure like:solidjs to set default value to unsolved promise
 */
export function configPromiseDefault<P extends Promise<any>, T>(promise: P, value: T): P & { default: T } {
  return Object.assign(promise, { default: value })
}
