import { expect, test, vi } from "vitest"
import { lazyDo } from "./lazyDo"

test("lazyDo - 懒执行且仅执行一次", () => {
  const base = { count: 1 }
  const worker = vi.fn((draft: any) => {
    draft.count = 2
  })

  const lazy = lazyDo(base, worker)

  expect(worker).not.toHaveBeenCalled()
  expect(lazy.count).toBe(2)
  expect(worker).toHaveBeenCalledTimes(1)
  expect(lazy.count).toBe(2)
  expect(worker).toHaveBeenCalledTimes(1)
  expect(base.count).toBe(1)
})

test("lazyDo - 深层更新采用 copy-on-write", () => {
  const base = {
    a: { b: 1 },
    keep: { stable: true },
  }

  const lazy = lazyDo(base, (draft) => {
    draft.a.b = 2
    ;(draft.a as any).c = 3
  })

  expect(lazy.a).toEqual({ b: 2, c: 3 })
  expect(base.a).toEqual({ b: 1 })
  expect(lazy.keep).toBe(base.keep)
})

test("lazyDo - delete 与 in 语义正确", () => {
  const base: { a?: number; b: number } = { a: 1, b: 2 }

  const lazy = lazyDo(base, (draft) => {
    delete draft.a
    draft.b = 3
  })

  expect("a" in lazy).toBe(false)
  expect(lazy.a).toBeUndefined()
  expect("b" in lazy).toBe(true)
  expect(lazy.b).toBe(3)
  expect(base).toEqual({ a: 1, b: 2 })
})

test("lazyDo - 支持 defineProperty 描述符", () => {
  const lazy = lazyDo({} as Record<string, any>, (draft) => {
    Object.defineProperty(draft, "secret", {
      value: 42,
      enumerable: false,
      configurable: true,
      writable: false,
    })
  })

  expect(lazy.secret).toBe(42)
  expect(Object.keys(lazy)).not.toContain("secret")

  const desc = Object.getOwnPropertyDescriptor(lazy, "secret")
  expect(desc?.enumerable).toBe(false)
  expect(desc?.writable).toBe(false)
})

test("lazyDo - 返回新对象时优先使用返回值", () => {
  const base = { a: 1 }

  const lazy = lazyDo(base, (draft) => {
    draft.a = 2
    return { a: 100, b: 200 }
  })

  expect(lazy.a).toBe(100)
  expect((lazy as any).b).toBe(200)
  expect(base.a).toBe(1)
})

test("lazyDo - 方法调用时 this 绑定到产物对象", () => {
  const base = {
    value: 1,
    add(n: number) {
      this.value += n
      return this.value
    },
  }

  const lazy = lazyDo(base, (draft) => {
    draft.value = 10
  })

  const add = lazy.add as (n: number) => number
  expect(add(5)).toBe(15)
  expect(lazy.value).toBe(15)
})
