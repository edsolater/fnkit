/**
 * list of object item to object of item
 * @example
 * listToMap([{id:'xxx', name:'hello'}, {id:'yy', name:'world'}], i => i.id) => {xxx: {id:'xxx', name:'hello'}, yy: {id:'yy', name:'world'}}
 */
export function listToRecord<T, S extends string, V = T>(
  source: T[],
  getKey: (item: T, index: number) => S,
  getValue?: (item: T, index: number) => V,
): Record<S, V> {
  // @ts-expect-error force
  return Object.fromEntries(source.map((item, idx) => [getKey(item, idx), getValue ? getValue(item, idx) : item]))
}

/**
 * @returns a js Map object instead of a plain object
 */
export function listToMap<T, S, V = T>(
  source: T[],
  getKey: (item: T, index: number) => S,
  getValue?: (item: T, index: number) => V,
): Map<S, V> {
  // @ts-expect-error force
  return new Map(source.map((item, idx) => [getKey(item, idx), getValue ? getValue(item, idx) : item]))
}
