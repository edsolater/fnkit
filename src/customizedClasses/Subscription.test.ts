import { expect, test, vi } from "vitest"
import { createSubscription } from "./Subscription"

test("Subscription 只执行一次取消逻辑，并公开关闭状态", () => {
  const onUnsubscribe = vi.fn()
  const subscription = createSubscription({ onUnsubscribe })

  expect(subscription.closed).toBe(false)

  subscription.unsubscribe()
  subscription.unsubscribe()

  expect(subscription.closed).toBe(true)
  expect(onUnsubscribe).toHaveBeenCalledOnce()
})
