/**
 * 计算三角形斜边长度
 * @param dx 直角边X
 * @param dy 直角边Y
 */
export function calcHypotenuse(dx: number, dy: number): number {
  return Math.sqrt(dx ** 2 + dy ** 2)
}

/**
 * 类似于css的clamp()，目的为：限定值的范围
 * @param  minValue 下限
 * @param  currValue 浮动值（目标值）
 * @param  maxValue 上限
 * @example
 * clamp(2, 40, 80) // 40
 * clamp(2, 90, 80) // 80
 */
export function clamp(minValue: number, currValue: number, maxValue: number) {
  return Math.min(Math.max(minValue, currValue), maxValue)
}

/**
 * 获取多个点之间的距离的和（至少两个点，否则会取到没有意义的0）
 * @param n1
 * @param n2
 * @example
 * getDistance(3, 4) // 1
 * getDistance(3, 4, 6) // 3
 * getDistance(3, 4, 6, 7) // 4
 */
export function computeDistance(...ns: number[]) {
  let result = 0
  for (let i = 1; i < ns.length; i++) {
    const pre = ns[i - 1]
    const cur = ns[i]
    result += Math.abs(pre - cur)
  }
  return result
}

/**
 * 无论值怎么变，保证他符号不变，否则就归零（负数依然是负数，正数依然是正数）
 * @param number 值
 * @param sign 符号
 * @example
 * staySameSign(-99, -1) // -99
 * staySameSign(-99, 1) // 0
 */
export function staySameSign(number: number, sign: number) {
  if (Math.sign(sign) === -1) {
    return number > 0 ? 0 : number
  } else if (Math.sign(sign) === 1) {
    return number < 0 ? 0 : number
  } else {
    return 0
  }
}
