//replace for

type ForFunction<T, U> = (
  item: T,
  providedUtils: {
    index: number
    items: Iterable<T>
    itemsArray: T[]
  },
) => U

type CallbackObject<T, U> = {
  /** return undefined means continue next loop */
  for: ForFunction<T, U>
  /* run epoch when matched */
  when?: (item: T) => boolean
  /* stop loop when matched */
  until?: (item: T) => boolean
}

/**
 *
 * 声明式的for循环
 * TODO：需要添加测试
 *
 * 没有过程式的runtime-continue 与runtime-break
 * @example
 * loop(5, (item, {index}) => { console.log(index) }) // loop 5 times
 * loop(['a', 'b', 'c'], (item) => { console.log(item) }) // loop array
 * loop(['a', 'b', 'c'], { for: (item) => { console.log(item) }, when: (item) => item !== 'b' }) // 'a' 'c'
 * loop(['a', 'b', 'c'], { for: (item) => { console.log(item) }, until: (item) => item === 'b' }) // 'a'
 * @param arr
 * @param callbackOption
 */
export function loop<T, U>(
  target: Iterable<T> | number /* loop count */,
  callbackOption: ForFunction<T, U> | CallbackObject<T, U>,
): U[] {
  let index = 0
  const iterable: Iterable<T> =
    typeof target === "number" ? Array.from({ length: target }, (_, i) => i as unknown as T) : target
  const result: U[] = []
  const callbackObject: CallbackObject<T, U> =
    typeof callbackOption === "function" ? { for: callbackOption } : callbackOption

  const providedUtils = {
    get index() {
      return index
    },
    items: iterable,
    get itemsArray() {
      // 懒缓存（memoized getter）:
      // 缓存一次，第二次访问不再重新构造
      const array = Array.isArray(iterable) ? iterable : Array.from(iterable)
      Object.defineProperty(this, "itemsArray", {
        value: array,
        writable: false,
        configurable: false,
      })
      return array
    },
  }

  for (const item of iterable) {
    if (callbackObject.until?.(item)) break
    if (callbackObject.when && !callbackObject.when(item)) continue

    const thisLoopResult = callbackObject.for(item, providedUtils)
    if (thisLoopResult !== undefined) {
      result.push(thisLoopResult)
    }
    index++
  }
  return result
}
