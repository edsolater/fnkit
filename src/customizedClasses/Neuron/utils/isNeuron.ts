import { Neuron } from "../Neuron"

/** 判断一个值是不是 Neuron；不知道它接收什么值，所以不能直接拿来 tick。 */
export function isNeuron(data: unknown): data is Neuron<unknown, never> {
  return data instanceof Neuron
}
