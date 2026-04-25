

/**
 * 如果需要就绑定 this，否则直接返回原值
 * @param value 可能是函数的值
 * @param thisArg 需要绑定的 this
 * @returns 如果 value 是函数则返回绑定了 thisArg 的函数，否则直接返回 value
 */
export function bindThisIfFunction<T>(value: T, thisArg: any): T {
  if (typeof value === "function") {
    return value.bind(thisArg)
  }
  return value
}