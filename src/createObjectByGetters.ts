/**
 *
 * @example
 * createObjectByGetters({ aa: () => 'hello' }) //=> { aa: 'hello' }
 */
export function createObjectByGetters<K extends keyof any, V>(getterDescroptions: Record<K, () => V>): Record<K, V> {
  return new Proxy(getterDescroptions, {
    get(target, p, receiver) {
      const rawGetter = Reflect.get(target, p, receiver)
      return rawGetter()
    }
  }) as Record<K, V>
}
