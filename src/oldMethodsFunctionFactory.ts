import { flap } from './collectionMethods'
import { isObjectLike } from './dataType'
import { AnyArr, AnyFn } from './typings/constants'

/**
 * attach a param to the function.return the function's copy.
 * predefined param and runtime param will merge eventually
 *
 * @returns new function
 * @example
 * const newFormat = attachArgs(format, 1, { alwaysSign: true })
 * console.log(newFormat(123456)) // same as : format(123456, { alwaysSign: true})
 */
export function attachArgs<F extends AnyFn, Index extends number>(
  fn: F,
  paramIndex: Index,
  param: Partial<Parameters<F>[Index]>
): F {
  const partlyInvokedFunction = (...args: Parameters<F>) => {
    const oldParam = args[paramIndex]
    const newParam = isObjectLike(oldParam) && isObjectLike(param) ? flap([oldParam, param]) : param
    return fn(...args.slice(0, paramIndex), newParam, ...args.slice(paramIndex + 1))
  }
  //@ts-ignore
  return partlyInvokedFunction
}

/**
 * 绑定函数的头几个参数
 * 与原生的.bind 作用相同
 * @param fn 原函数
 * @param headArgs 头几个参数
 * @example
 * const add = (a: number, b: number) => a + b
 * const testFn = bindHead(add, 3)
 * // testFn(1) === add(3, 1)
 */
export function bindHead<T extends AnyArr, U extends AnyArr, R>(
  fn: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => fn(...headArgs, ...tailArgs)
}

/**
 * 绑定函数参数，以生成一个新函数
 * @deprecated 直接写箭头函数更方便
 * @returns
 */
export function bindParams<T extends AnyFn>(
  fn: T | undefined,
  params: Parameters<T>
): () => ReturnType<T> {
  return () => fn?.(...params)
}

/**
 * 绑定除第一传参以外的其他传参，返回新的函数
 * 一般用于绑定特定的函数配置
 * @param fn 目标函数
 * @param tailArgs 函数的第二传参、第三传参、第四传参……
 * @example
 * const add = (a: string, b: number, c: number ,d: number) => a + b + c
 * const foo = bindTail(add, 3, 3) // foo :: string -> number
 * const foo2 = bindTail(add, 3, 3, 4) // foo :: string -> number
 * @todo 类型提示中的函数名称没有了，不太好
 */
export function bindTail<T, U extends AnyArr, R>(fn: (...args: [T, ...U]) => R, ...tailArgs: U) {
  return (head: T) => fn(head, ...tailArgs)
}

/**
 * @example
 * const hasHello = checkProp('hello', v => Boolean(v))
 * console.log(hasHello({hello: 3})) //=> true
 */
export function checkProp(propName: string | symbol, checker: (value: any) => boolean | void) {
  return (obj) => Boolean(isObjectLike(obj) && checker(obj[propName]))
}

/**
 * @todo test it !!!
 * it's a function, that handle error use try/catch
 *
 * if you will pass some parameter to the function, please wrap it in an empty arrow function
 * @example
 * const saveFunction = safer(dosomething, (e)=>{console.log(e)})
 * const asyncSaveFunction = safer(asyncDosomething, (e)=>{console.log(e)})
 */
export function safer<
  F extends (...params: any[]) => any,
  Handler extends (error: unknown) => void
>(
  fn: F,
  handler: Handler
): F & {
  originalFunction: F
  errorHandler: Handler
} {
  function safeFunction(...params: Parameters<F>) {
    try {
      const result = fn(...params)
      if (result instanceof Promise) {
        result.catch((e) => handler(e))
      }
      return result
    } catch (err) {
      handler(err)
    }
  }
  safeFunction.originalFunction = fn
  safeFunction.errorHandler = handler
  //@ts-ignore
  return safeFunction
}

/**
 * @example
 * const origionFn = () => {}
 * const newFn = overwriteFunctionName(originFn, 'newName')
 * console.log(newFn.name) //=> 'newName'
 */
export function overwriteFunctionName<F extends (...params: any[]) => any>(
  func: F,
  name: string
): F {
  const temp = {
    [name]: (...args: any[]) => func(...args)
  }
  return temp[name] as F
}
