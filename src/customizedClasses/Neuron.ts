import { isObject } from '../dataType'
import { createEventCenter } from './EventCenter'
import { Subscription } from './Subscription'
import { WeakerMap } from './WeakerMap'

export function isNeuron(data: any): data is Neuron<unknown> {
  return isObject(data) && data['_isNeuron']
}

/**
 * Neuron **does not** store value
 */
export type Neuron<T> = {
  _isNeuron: true
  subscribe: (subscriptionFn: (item: T) => void) => Subscription
  link(neuronB: Neuron<T>): { unlink(): void }
  unlink(neuronB: Neuron<T>): void
  // infuse a value to Neuron
  infuse: (item: T) => void
}

export function createNeuron<T>(
  initValue: T,
  options?: {
    /* TODO */
  }
): Neuron<T> {
  const linkedNeurons = new WeakerMap<Neuron<T>, Subscription>()
  const eventCenter = createEventCenter<{ changeValue: (item: T) => void }>()
  const subscribe = eventCenter.onChangeValue
  const link: Neuron<T>['link'] = (neuronB) => {
    const subscription = subscribe((v) => neuronB.infuse?.(v))
    linkedNeurons.set(neuronB, subscription)
    return { unlink: () => unlink(neuronB) }
  }
  const unlink: Neuron<T>['unlink'] = (neuronB) => {
    const subscription = linkedNeurons.get(neuronB)
    return subscription?.unsubscribe()
  }
  const infuse: Neuron<T>['infuse'] = (item) => {
    eventCenter.emit('changeValue', [item])
  }
  return {
    _isNeuron: true,
    subscribe: eventCenter.onChangeValue,
    link,
    unlink,
    infuse
  }
}
