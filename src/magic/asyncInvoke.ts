import { AnyFn } from '../typings'

const actionStack = new Map<any, AnyFn>()
export function asyncInvoke(
  cb: AnyFn,
  options?: {
    /** for register's Map key */
    key?: any
  }
) {
  actionStack.set(options?.key ?? {}, cb)
  Promise.resolve().then(() => {
    actionStack.forEach((cb) => cb())
    actionStack.clear()
  })
}
