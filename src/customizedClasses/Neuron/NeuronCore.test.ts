import { expect, test, vi } from "vitest"
import { createNeuronCore } from "./NeuronCore"

test("NeuronCore 通过 EventEmitter 订阅和取消值传播", () => {
  const neuron = createNeuronCore<number>()
  const listener = vi.fn()
  const subscription = neuron.subscribe(listener)

  neuron.infuse(1)
  subscription.unsubscribe()
  neuron.infuse(2)

  expect(listener).toHaveBeenCalledOnce()
  expect(listener).toHaveBeenCalledWith(1)
})

test("NeuronCore link 把值传给目标，并由 unlink 停止传播", () => {
  const source = createNeuronCore<number>()
  const target = createNeuronCore<number>()
  const targetListener = vi.fn()
  const link = source.link(target)

  target.subscribe(targetListener)
  source.infuse(1)
  link.unlink()
  source.infuse(2)

  expect(targetListener).toHaveBeenCalledOnce()
  expect(targetListener).toHaveBeenCalledWith(1)
})
