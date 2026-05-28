
export function isEither<T>(...conditions: ((item: T) => boolean)[]): (item: T) => boolean {
  return (item) => conditions.some((fn) => fn(item));
}
export function isAll<T>(...conditions: ((item: T) => boolean)[]): (item: T) => boolean {
  return (item) => conditions.every((fn) => fn(item));
}
