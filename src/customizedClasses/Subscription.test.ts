import { expect, test, vi } from "vitest"
import { Subscription } from "./Subscription"

test("Subscription 只执行一次取消逻辑，并公开关闭状态", () => {
  const onUnsubscribe = vi.fn()
  const subscription = new Subscription({ onUnsubscribe })
  const { unsubscribe } = subscription

  expect(subscription.closed).toBe(false)

  unsubscribe()
  unsubscribe()

  expect(subscription.closed).toBe(true)
  expect(onUnsubscribe).toHaveBeenCalledOnce()
})
