type Observer<T> = (value: T) => void

/**
 * 数据流
 */
export class River<T> {
  #subs = new Set<Observer<T>>()
  #stopped = false
  #error: any = null

  // 推动水流
  flow(value: T) {
    if (this.#stopped) return
    for (const fn of this.#subs) fn(value)
  }

  // 观察河流
  subscribe(fn: Observer<T>) {
    this.#subs.add(fn)
    return () => this.#subs.delete(fn)
  }

  // 转化流体
  map<U>(fn: (v: T) => U): River<U> {
    const next = new River<U>()
    this.subscribe((v) => next.flow(fn(v)))
    return next
  }

  // 过滤流体
  filter(fn: (v: T) => boolean): River<T> {
    const next = new River<T>()
    this.subscribe((v) => fn(v) && next.flow(v))
    return next
  }

  // 支流（返回两条分支河）
  branch(fn: (v: T) => boolean): [River<T>, River<T>] {
    const left = new River<T>()
    const right = new River<T>()
    this.subscribe((v) => (fn(v) ? left.flow(v) : right.flow(v)))
    return [left, right]
  }

  // 汇流（两河合一）
  merge<U>(other: River<U>): River<T | U> {
    const merged = new River<T | U>()
    this.subscribe((v) => merged.flow(v))
    other.subscribe((v) => merged.flow(v))
    return merged
  }

  // 河流干涸（不再流动）
  dry() {
    this.#stopped = true
    this.#subs.clear()
  }

  // 污染河流（错误）
  fail(err: any) {
    this.#error = err
    this.dry()
  }
}
