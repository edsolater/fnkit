import { isObjectLike } from "../dataType"
import type { MayFn } from "../typings"
import { shrinkFn } from "../wrapper"

type UserAttachedValue = any
export type InfinityObjNode<V extends UserAttachedValue = any> = {
  (): V
  [currentPathFromRoot]: (keyof any)[]
  [loadSelf]: (value: MayFn<V, [oldValue: V]>) => void
  [infinityNode]: true
}
const currentPathFromRoot = Symbol("currentPathFromRoot")
const infinityNode = Symbol("isInfinityNode")
const loadSelf = Symbol("load")

/**
 * core part of createFakeTree, it's a common utils, no need to use it directly
 * can get more through this node
 */
export function createTreeableInfinityNode({
  currentKeyPath = [],
  attachedValueMap = new Map<keyof any, UserAttachedValue>(),
  getDefaultNodeValue,
  nodeValue,
}: {
  currentKeyPath?: (keyof any)[]
  attachedValueMap?: Map<string | number | symbol, any>
  nodeValue?: any
  getDefaultNodeValue?: () => any
} = {}) {
  const pathCollector = new Proxy(createInfinityNode(currentKeyPath, nodeValue ?? getDefaultNodeValue?.()), {
    get(target, key) {
      if (key in target) return Reflect.get(target, key)
      const paths = target[currentPathFromRoot].concat(key)
      const flatedKey = parseShallowKeyFromKeyArray(paths)
      if (attachedValueMap.has(flatedKey)) return attachedValueMap.get(flatedKey)
      else {
        const newInfiniteNode = createTreeableInfinityNode({
          currentKeyPath: paths,
          attachedValueMap,
          nodeValue: nodeValue?.[key],
          getDefaultNodeValue,
        })
        attachedValueMap.set(flatedKey, newInfiniteNode)
        return newInfiniteNode
      }
    },
  })
  return pathCollector
}

/**
 * can't get more through this node
 */
function createInfinityNode<T>(paths: (keyof any)[] = [], value?: T): InfinityObjNode {
  let nodeValue = value
  return Object.assign(() => nodeValue, {
    [currentPathFromRoot]: paths,
    [infinityNode]: true,
    [loadSelf]: (value: MayFn<T, [oldValue: T | undefined]>) => {
      const newValue = shrinkFn(value, [nodeValue])
      nodeValue = newValue
    },
  }) as InfinityObjNode
}

export function isInfinityNode(value: any): value is InfinityObjNode {
  return isObjectLike(value) && currentPathFromRoot in value
}

export function loadInfinityObjNode<T>(node: InfinityObjNode<T>, value: MayFn<T, [oldValue: T | undefined]>) {
  node[loadSelf](value)
}

/**
 * a util
 * type key array: (keyof any)[] into an string
 * @todo into a symbol
 * @todo should accept object also , not just string | number | symbol
 *
 * @example
 * parseShallowKeyFromArray([2, 3, 4]) === parseShallowKeyFromArray([2, 3, 4])
 * @see
 * https://github.dev/bloomberg/record-tuple-polyfill/blob/5f9cae34f0d331c4836efbc9cd618836c03e75f5/packages/record-tuple-polyfill/src/tuple.js
 */
export function parseShallowKeyFromKeyArray(shallowKey: (keyof any)[]) {
  return shallowKey.map((v) => String(v)).join(", ")
}
