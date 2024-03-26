import { isFunction } from "./dataType"
import { AnyFn } from "./typings"

/**
 *
 * @example
 * createObjectByGetters({ aa: () => 'hello' }) //=> { aa: 'hello' }
 */
export function createObjectFromGetters<O extends Record<keyof any, unknown>>(
  getterDescroptions: O,
): {
  [K in keyof O]: O[K] extends undefined ? undefined : O[K] extends AnyFn ? ReturnType<NonNullable<O[K]>> : O[K]
} {
  return new Proxy(getterDescroptions, {
    get(target, p, receiver) {
      const rawGetter = Reflect.get(target, p, receiver)
      return isFunction(rawGetter) ? rawGetter() : rawGetter
    },
  }) as any
}
