export function createTimeoutMap<K, V>({ maxAgeMs }: { maxAgeMs: number }) {
  const innerMap = new Map<K, V>()
  const timeoutMap = new Map<K, number | NodeJS.Timeout>()

  function createAutoDeleteTimeout(key: K) {
    if (timeoutMap.has(key)) {
      const timeoutId = timeoutMap.get(key)
      clearTimeout(timeoutId)
    }

    const newAutoDeleteTimeoutId = setTimeout(() => {
      innerMap.delete(key)
      timeoutMap.delete(key)
    }, maxAgeMs)

    timeoutMap.set(key, newAutoDeleteTimeoutId)
  }

  return new Proxy(innerMap, {
    get(target, key) {
      if (key === "set") {
        return (key: K, value: V) => {
          createAutoDeleteTimeout(key)
          return target.set(key, value)
        }
      } else {
        return Reflect.get(target, key)
      }
    },
  })
}
