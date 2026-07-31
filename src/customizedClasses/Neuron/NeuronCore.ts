import { EventEmitter } from "../EventEmitter"
import { Subscription } from "../Subscription"
import { WeakerMap } from "../WeakerMap"

/**
 * Neuron **does not** store value
 */

export type NeuronCore<T> = {
  _isNeuron: true
  subscribe: (subscriptionFn: (item: T) => void) => Subscription
  link(neuronB: NeuronCore<T>): { unlink(): void }
  unlink(neuronB: NeuronCore<T>): void
  // infuse a value to Neuron
  infuse: (item: T) => void
}
//NOTE: options is not used by core, but a placeholder for factory plugin

export function createNeuronCore<T>(options?: {}): NeuronCore<T> {
  const linkedNeurons = new WeakerMap<NeuronCore<T>, Subscription>()
  const eventEmitter = new EventEmitter<{ changeValue: [item: T] }>()
  const subscribe: NeuronCore<T>["subscribe"] = (listener) => eventEmitter.on("changeValue", listener)
  const link: NeuronCore<T>["link"] = (neuronB) => {
    const subscription = subscribe((v) => neuronB.infuse(v))
    linkedNeurons.set(neuronB, subscription)
    return { unlink: () => unlink(neuronB) }
  }
  const unlink: NeuronCore<T>["unlink"] = (neuronB) => {
    const subscription = linkedNeurons.get(neuronB)
    return subscription?.unsubscribe()
  }
  const infuse: NeuronCore<T>["infuse"] = (item) => {
    eventEmitter.emit("changeValue", [item])
  }
  return {
    _isNeuron: true,
    subscribe,
    link,
    unlink,
    infuse,
  }
}
