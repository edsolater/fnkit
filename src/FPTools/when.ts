/**
 * FP 函数式编程
 * make code more readable
 */
export function whenDefined<T, F>(value: T | undefined, callbackFunction: (value: T) => F): F | undefined
export function whenDefined<T, F>(value: T | undefined, callbackFunction: (value: T) => F, fallbackValue: F): F
export function whenDefined<T, F>(
  value: T | undefined,
  callbackFunction: (value: T) => F,
  fallbackValue?: F,
): F | undefined {
  if (value != null) {
    return callbackFunction(value)
  } else {
    return fallbackValue
  }
}

/**
 * FP 函数式编程
 * make code more readable 使代码更易读
 */
export function when<T, F>(value: T, is: (value: T) => boolean, callbackFunction: (v: T) => F): F | undefined
export function when<T, F>(value: T, is: (value: T) => boolean, callbackFunction: (v: T) => F, fallbackValue: F): F
export function when<T, F>(
  value: T,
  is: (value: T) => boolean,
  callbackFunction: (v: T) => F,
  fallbackValue?: F,
): F | undefined {
  if (is(value)) {
    return callbackFunction(value)
  } else {
    return fallbackValue
  }
}
