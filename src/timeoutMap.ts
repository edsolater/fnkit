import { isFunction } from "./dataType"
import { setTimeoutWithSecondes } from "./date"

export function createTimeoutMap<K, V>({ maxAge }: { maxAge: number }) {
  const innerMap = new Map<K, V>()
  const timeoutMap = new Map<K, number | NodeJS.Timeout>()

  function createAutoDeleteTimeout(key: K) {
    if (timeoutMap.has(key)) {
      const timeoutId = timeoutMap.get(key)
      clearTimeout(timeoutId)
    }

    const newAutoDeleteTimeoutId = setTimeoutWithSecondes(() => {
      innerMap.delete(key)
      timeoutMap.delete(key)
    }, maxAge)

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
        const result = target[key]
        return isFunction(result) ? result.bind(target) : result
      }
    },
  })
}
