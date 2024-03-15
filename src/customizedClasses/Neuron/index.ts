import { makeNeuronMappable, MappedNeuron } from "./makeNeuronMappable"
import { createNeuronCore } from "./NeuronCore"

export type Neuron<T> = MappedNeuron<T>

export const createNeuron = makeNeuronMappable(createNeuronCore)
