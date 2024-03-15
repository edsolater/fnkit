import { Cover } from "../.."
import { NeuronCore } from "./NeuronCore"

type GetNeuronOptions<F extends (options?: Record<keyof any, any>) => NeuronCore<any>> = Parameters<F>[0]
type GetNeuronValue<F extends (options?: Record<keyof any, any>) => NeuronCore<any>> =
  ReturnType<F> extends NeuronCore<infer V> ? V : never

export type MappedNeuron<T> = NeuronCore<T> & {
  createByMap<U>(mapper: (v: T) => U): MappedNeuron<U>
} // TODO: type generic is not plugin type

export type MakeNeuronMappable<F extends (options?: Record<keyof any, any>) => NeuronCore<any>> = <
  T = GetNeuronValue<F>,
>(
  newOptions?: GetNeuronOptions<F>,
) => Cover<ReturnType<F>, MappedNeuron<T>>

/**
 * const createNeuron = letValueMappable(createNeuronCore)
 * const neuron = createNeuron<string>().createByMap((i) => i + 2)
 */
export function makeNeuronMappable<F extends (options?: Record<keyof any, any>) => NeuronCore<any>>(
  createFn: F,
): MakeNeuronMappable<F> {
  const valueMappableFn = ((options) => {
    const originalNeuron = createFn(options)
    return Object.assign(originalNeuron, {
      createByMap(mapper) {
        const newNeuron = createFn(options)
        originalNeuron.subscribe((i) => newNeuron.infuse(mapper(i)))
        return newNeuron
      },
    })
  }) as MakeNeuronMappable<F>
  return valueMappableFn
}
