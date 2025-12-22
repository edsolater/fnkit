/**
 * FP 函数式编程 （但纯粹使用时，还不如三元判断符简洁）
 * make code more readable
 * 使代码更符合阅读习惯
 * @example
 * whenDefined(5, v => v * 2) //=> 10
 */
export function whenDefined<T, F>(value: T | undefined, whenFulfilled: (value: T) => F): F | undefined
export function whenDefined<T, F>(value: T | undefined, whenFulfilled: (value: T) => F, fallbackValue: F): F
export function whenDefined<T, F>(
  value: T | undefined,
  whenFulfilled: (value: T) => F,
  fallbackValue?: F,
): F | undefined {
  if (value != null) {
    return whenFulfilled(value)
  } else {
    return fallbackValue
  }
}

/**
 * FP 函数式编程
 * make code more readable 使代码更符合阅读习惯
 * @example
 * when(5, v => v > 3, v => v * 2) //=> 10
 */
export function when<T, F>(value: T, is: (value: T) => boolean, whenFulfilled: (v: T) => F): F | undefined
export function when<T, F>(value: T, is: (value: T) => boolean, whenFulfilled: (v: T) => F, fallbackValue: F): F
export function when<T, F>(
  value: T,
  is: (value: T) => boolean,
  whenFulfilled: (v: T) => F,
  fallbackValue?: F,
): F | undefined {
  if (is(value)) {
    return whenFulfilled(value)
  } else {
    return fallbackValue
  }
}
