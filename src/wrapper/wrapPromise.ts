export default function wrapPromise<T>(v: T | Promise<T> | PromiseLike<T>): Promise<T> {
  return v instanceof Promise ? v : Promise.resolve(v)
}
