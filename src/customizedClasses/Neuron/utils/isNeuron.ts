import { isObject } from '../../../dataType';
import { NeuronCore } from '../NeuronCore';


export function isNeuron(data: any): data is NeuronCore<unknown> {
  return isObject(data) && data['_isNeuron'];
}
