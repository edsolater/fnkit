import { curry } from "./curry"

/**
 * curry version of `xxx ?? yyy`
 * @example
 *
 * withAddDefault(1)(undefined) // 1
 * withAddDefault(1)(2) // 2
 */
export const withAddDefault = <T>(
  fallbackValue: T,
  options?: {
    applyWhen?:
      | "falsy"
      | "nil"
      /** fallback function */
      | ((v: any) => boolean)
  },
): (<W>(v: W) => T | NonNullable<W>) =>
  curry((v) => {
    if (!options || options.applyWhen === "nil") {
      return v ?? fallbackValue
    } else if (options.applyWhen === "falsy") {
      return v || fallbackValue
    } else {
      return options.applyWhen?.(v) ? fallbackValue : v
    }
  })
