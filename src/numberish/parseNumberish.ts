import { isFunction, isObject } from "../dataType"
import { Numberish, PureNumberish } from "./types"

/** for numberish can also be any object which can transform to numberish(has property: toNumberish, which return a numberish) */
export function impureNumberish(n: Numberish): PureNumberish {
  return isObject(n) && isFunction(n["toNumberish"]) ? n["toNumberish"]() : n
}
