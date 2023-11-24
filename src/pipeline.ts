/**
 * FP utils : give opportunity to handle/change value in parallel
 *
 * always return v
 *
 * @param v input value
 * @param handlers opportunity to change value or just do something
 * @returns handled v / original v (depend on handlers)
 * @todo already have move to fnkit
 */
export function pipeline<T>(v: T, ...handlers: ((v: T) => undefined | T)[]): T {
  handlers.reduce((v, handler) => handler(v) ?? v, v)
  return v
}
