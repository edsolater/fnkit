import { isNullish } from "./dataType"

/**
 * useful for structure other basements
 */
export function toStringOrUndefined(s: unknown): string | undefined {
  return isNullish(s) ? undefined : String(s)
}
