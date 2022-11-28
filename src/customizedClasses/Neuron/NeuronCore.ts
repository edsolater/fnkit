import { createEventCenter } from '../EventCenter';
import { Subscription } from '../Subscription';
import { WeakerMap } from '../WeakerMap';

/**
 * Neuron **does not** store value
 */

export type NeuronCore<T> = {
  _isNeuron: true;
  subscribe: (subscriptionFn: (item: T) => void) => Subscription;
  link(neuronB: NeuronCore<T>): { unlink(): void; };
  unlink(neuronB: NeuronCore<T>): void;
  // infuse a value to Neuron
  infuse: (item: T) => void;
};
//NOTE: options is not used by core, but a placeholder for factory plugin

export function createNeuronCore<T>(options?: {}): NeuronCore<T> {
  const linkedNeurons = new WeakerMap<NeuronCore<T>, Subscription>();
  const eventCenter = createEventCenter<{ changeValue: (item: T) => void; }>();
  const subscribe = eventCenter.onChangeValue;
  const link: NeuronCore<T>['link'] = (neuronB) => {
    const subscription = subscribe((v) => neuronB.infuse?.(v));
    linkedNeurons.set(neuronB, subscription);
    return { unlink: () => unlink(neuronB) };
  };
  const unlink: NeuronCore<T>['unlink'] = (neuronB) => {
    const subscription = linkedNeurons.get(neuronB);
    return subscription?.unsubscribe();
  };
  const infuse: NeuronCore<T>['infuse'] = (item) => {
    eventCenter.emit('changeValue', [item]);
  };
  return {
    _isNeuron: true,
    subscribe: eventCenter.onChangeValue,
    link,
    unlink,
    infuse
  };
}
