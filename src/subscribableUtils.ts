import type { Subscribable } from "./customizedClasses"

/**
 * (helper function for {@link Subscribable})
 * 
 * sync two subscribable's data
 * @param s1 a subscribable to be sync with s2
 * @param s2 a subscribable to be sync with s1
 * @param options more accurate control utils
 * @example
 * const s1 = createSubscribable(1)
 * const s2 = createSubscribable(2)
 * syncDataBetweenTwoSubscribable(s1, s2)
 * s1.set(3) // s2 will be 3 too
 */
export function syncDataBetweenTwoSubscribable<T, U>(
  s1: Subscribable<T>,
  s2: Subscribable<U>,
  options?: {
    /**
     * initly s1 is subscribable<'first'> and s2 is subscribable<'second'>
     * if initValueRespect is '1', s2 will be 'first'
     * if initValueRespect is '2', s1 will be 'second'
     */
    initValueRespect?: "1" | "2" | "auto"
    setFrom1?: (value: T, subscribable2: Subscribable<U>) => void
    setFrom2?: (value: U, subscribable1: Subscribable<T>) => void
  },
) {
  let currentValue =
    options?.initValueRespect === "1"
      ? s1()
      : options?.initValueRespect === "2"
      ? s2()
      : options?.initValueRespect === "auto" || options?.initValueRespect == null
      ? s1() ?? s2()
      : undefined
  const onSetFrom1 = (v1: T) => {
    options && "setFrom1" in options ? options?.setFrom1?.(v1, s2) : s2.set(v1 as any)
  }
  const onSetFrom2 = (v2: U) => {
    options && "setFrom2" in options ? options?.setFrom2?.(v2, s1) : s1.set(v2 as any)
  }

  s1.subscribe((v1) => {
    if (v1 !== currentValue) {
      currentValue = v1
      onSetFrom1(v1)
    }
  })
  s2.subscribe((v2) => {
    if (v2 !== currentValue) {
      currentValue = v2
      onSetFrom2(v2)
    }
  })
}
