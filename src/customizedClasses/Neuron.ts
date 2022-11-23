import { isObject } from '../dataType'
import { EventCenter } from './EventCenter'
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
  map: <NewOutput>(mapperFn: (item: T) => NewOutput) => Neuron<NewOutput>
  link(neuronB: Neuron<T>): { unlink(): void }
  unlink(neuronB: Neuron<T>): void
  // infuse a value to Neuron
  active: (item: T) => void
}

export function createNeuron<T>(
  initValue: T,
  options?: {
    /* TODO */
  }
): Neuron<T> {
  const linkedNeurons = new WeakerMap<Neuron<T>, Subscription>()
  const eventCenter = EventCenter<{ changeValue: (item: T) => void }>()
  const subscribe = eventCenter.onChangeValue
  const map: Neuron<T>['map'] = (mapperFn) => createNeuron(mapperFn(initValue))
  const link: Neuron<T>['link'] = (neuronB) => {
    const subscription = subscribe((v) => neuronB.active?.(v))
    linkedNeurons.set(neuronB, subscription)
    return { unlink: () => unlink(neuronB) }
  }
  const unlink: Neuron<T>['unlink'] = (neuronB) => {
    const subscription = linkedNeurons.get(neuronB)
    return subscription?.unsubscribe()
  }
  const active: Neuron<T>['active'] = (item) => {
    eventCenter.emit('changeValue', [item])
  }
  return {
    _isNeuron: true,
    subscribe: eventCenter.onChangeValue,
    map,
    link,
    unlink,
    active
  }
}
