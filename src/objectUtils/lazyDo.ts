/**
 * ! AI写的， 还没有完全审查完lazyDo的实现
 */
import { isFunction, isObject } from ".."
import type { AnyObj } from "../typings"
import { computeOnce } from "./computeOnce"

type DeferredOperation =
  | { kind: "set"; path: PropertyKey[]; value: any }
  | { kind: "delete"; path: PropertyKey[] }
  | { kind: "define"; path: PropertyKey[]; descriptor: PropertyDescriptor }

function isObjectOrFunction(value: any): value is object {
  return isObject(value) || isFunction(value)
}

function isPlainObjectOrArray(value: any) {
  return (
    Array.isArray(value) || (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype)
  )
}

function shallowClone<T>(value: T): T {
  if (Array.isArray(value)) return value.slice() as any
  if (value && typeof value === "object") return { ...(value as any) }
  return value
}

function getValueAtPath(source: any, path: PropertyKey[]) {
  let currentValue = source
  for (const propertyKey of path) {
    if (!isObjectOrFunction(currentValue)) return undefined
    currentValue = (currentValue as any)[propertyKey]
  }
  return currentValue
}

/**
 * Copy-on-write set：沿 path 克隆链路节点，最后写入 value
 */
function setInCopyOnWrite(base: any, path: PropertyKey[], value: any) {
  if (path.length === 0) return value

  const clonedRoot = shallowClone(base)
  let currentNewNode: any = clonedRoot
  let currentOldNode: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const propertyKey = path[i]
    const oldChild = isObjectOrFunction(currentOldNode) ? currentOldNode[propertyKey] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : typeof path[i + 1] === "number" ? [] : {}

    currentNewNode[propertyKey] = newChild
    currentNewNode = newChild
    currentOldNode = oldChild
  }

  currentNewNode[path[path.length - 1]] = value
  return clonedRoot
}

function deleteInCopyOnWrite(base: any, path: PropertyKey[]) {
  if (path.length === 0) return base

  const clonedRoot = shallowClone(base)
  let currentNewNode: any = clonedRoot
  let currentOldNode: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const propertyKey = path[i]
    const oldChild = isObjectOrFunction(currentOldNode) ? currentOldNode[propertyKey] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : typeof path[i + 1] === "number" ? [] : {}

    currentNewNode[propertyKey] = newChild
    currentNewNode = newChild
    currentOldNode = oldChild
  }

  const lastPropertyKey = path[path.length - 1]
  if (Array.isArray(currentNewNode) && typeof lastPropertyKey === "number") {
    // 数组 delete 下标会产生 hole，这里按你预期选择：真的 delete
    delete currentNewNode[lastPropertyKey]
  } else {
    delete currentNewNode[lastPropertyKey]
  }

  return clonedRoot
}

function defineInCopyOnWrite(base: any, path: PropertyKey[], descriptor: PropertyDescriptor) {
  if (path.length === 0) return base

  const clonedRoot = shallowClone(base)
  let currentNewNode: any = clonedRoot
  let currentOldNode: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const propertyKey = path[i]
    const oldChild = isObjectOrFunction(currentOldNode) ? currentOldNode[propertyKey] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : {}
    currentNewNode[propertyKey] = newChild
    currentNewNode = newChild
    currentOldNode = oldChild
  }

  Object.defineProperty(currentNewNode, path[path.length - 1], descriptor)
  return clonedRoot
}

/**
 * 基于 patch 的“读”：如果某个路径被 set/delete/define 过，读到最新语义
 * 这里用一个 map 做“最后写入覆盖”，保证 draft 内部读到自己写过的值
 */
function buildLastOperationMap(operations: DeferredOperation[]) {
  const lastOperationByPath = new Map<string, DeferredOperation>()
  const pathToMapKey = (path: PropertyKey[]) => path.map(String).join("\u0000")

  for (const operation of operations) {
    lastOperationByPath.set(pathToMapKey(operation.path), operation)
  }

  return { lastOperationByPath, pathToMapKey }
}

function applyOperations(base: any, operations: DeferredOperation[]) {
  let updatedRoot = base

  for (const operation of operations) {
    if (operation.kind === "set") updatedRoot = setInCopyOnWrite(updatedRoot, operation.path, operation.value)
    else if (operation.kind === "delete") updatedRoot = deleteInCopyOnWrite(updatedRoot, operation.path)
    else updatedRoot = defineInCopyOnWrite(updatedRoot, operation.path, operation.descriptor)
  }

  return updatedRoot
}

function createDraft(base: any, operations: DeferredOperation[]) {
  // 缓存同一路径的 proxy，避免重复创建
  const proxyCache = new Map<string, any>()
  const { lastOperationByPath, pathToMapKey } = buildLastOperationMap(operations)

  const createPathProxy = (path: PropertyKey[]): any => {
    const cacheKey = pathToMapKey(path)
    if (proxyCache.has(cacheKey)) return proxyCache.get(cacheKey)

    const pathProxy = new Proxy({} as any, {
      get(_target, propertyKey) {
        // 读自己写过的值
        const operation = lastOperationByPath.get(pathToMapKey([...path, propertyKey]))
        if (operation?.kind === "set") return operation.value
        if (operation?.kind === "delete") return undefined

        const valueFromBase = getValueAtPath(base, [...path, propertyKey])
        // 深层对象继续返回 draft proxy，实现 deep 写入收集
        if (
          isObjectOrFunction(valueFromBase) &&
          (isPlainObjectOrArray(valueFromBase) || typeof valueFromBase === "function")
        ) {
          return createPathProxy([...path, propertyKey])
        }

        return valueFromBase
      },

      set(_target, propertyKey, value) {
        const operation: DeferredOperation = { kind: "set", path: [...path, propertyKey], value }
        operations.push(operation)
        lastOperationByPath.set(pathToMapKey(operation.path), operation)
        return true
      },

      deleteProperty(_target, propertyKey) {
        const operation: DeferredOperation = { kind: "delete", path: [...path, propertyKey] }
        operations.push(operation)
        lastOperationByPath.set(pathToMapKey(operation.path), operation)
        return true
      },

      defineProperty(_target, propertyKey, descriptor) {
        const operation: DeferredOperation = { kind: "define", path: [...path, propertyKey], descriptor }
        operations.push(operation)
        lastOperationByPath.set(pathToMapKey(operation.path), operation)
        return true
      },

      has(_target, propertyKey) {
        const operation = lastOperationByPath.get(pathToMapKey([...path, propertyKey]))
        if (operation?.kind === "delete") return false
        if (operation) return true

        const valueFromBase = getValueAtPath(base, [...path, propertyKey])
        return valueFromBase !== undefined
      },

      ownKeys() {
        // 简化：不把 delete/define/set 全并进去（需要的话可以做）
        const valueFromBase = getValueAtPath(base, path)
        return isObjectOrFunction(valueFromBase) ? Reflect.ownKeys(valueFromBase) : []
      },

      getOwnPropertyDescriptor(_target, propertyKey) {
        const operation = lastOperationByPath.get(pathToMapKey([...path, propertyKey]))
        if (operation?.kind === "delete") return undefined
        if (operation?.kind === "define") return operation.descriptor
        if (operation?.kind === "set") {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: operation.value,
          }
        }

        const valueFromBase = getValueAtPath(base, [...path])
        return isObjectOrFunction(valueFromBase)
          ? Object.getOwnPropertyDescriptor(valueFromBase, propertyKey)
          : undefined
      },
    })

    proxyCache.set(cacheKey, pathProxy)
    return pathProxy
  }

  return createPathProxy([])
}

/**
 * 更改对象，但是不执行：返回一个 Proxy，推迟到“使用”返回值时才执行 doSomething 并产出新对象。
 *
 * - 当你第一次读取属性 / in / Object.keys / 调用原型方法时，会触发 runEffect
 * - doSomething 在 runEffect 内部运行，拿到的是 draftProxy（只收集写入，不改 base）
 */
export function lazyDo<O extends AnyObj>(base: O, doSomething: (draft: O) => void): O
export function lazyDo<O extends AnyObj, U>(base: O, doSomething: (draft: O) => U): U
export function lazyDo(base: AnyObj, doSomething: (draft: AnyObj) => any) {
  const operations: DeferredOperation[] = []

  const lazyResult = computeOnce(() => {
    const draft = createDraft(base, operations)
    const resultOrUndefined = doSomething(draft)

    // 如果用户返回了一个“新根对象”，你可以选择：
    // A) 忽略 operations，直接用 returnedValue
    // B) 对 returnedValue 再 applyOperations（通常没必要）
    // 这里选择：如果 returnedValue 是对象就直接用 returnedValue，否则用 applyOperations(base, operations)
    return isObjectOrFunction(resultOrUndefined) ? resultOrUndefined : applyOperations(base, operations)
  })

  const handler: ProxyHandler<any> = {
    get(_target, propertyKey, _receiver) {
      const effectResult = lazyResult.value
      const propertyValue = Reflect.get(effectResult, propertyKey, effectResult)
      return isFunction(propertyValue) ? propertyValue.bind(effectResult) : propertyValue
    },

    set(_target, propertyKey, value) {
      const effectResult = lazyResult.value
      return Reflect.set(effectResult, propertyKey, value, effectResult)
    },

    has(_target, propertyKey) {
      const effectResult = lazyResult.value
      return Reflect.has(effectResult, propertyKey)
    },

    ownKeys() {
      const effectResult = lazyResult.value
      return Reflect.ownKeys(effectResult)
    },

    getOwnPropertyDescriptor(_target, propertyKey) {
      const effectResult = lazyResult.value
      return Object.getOwnPropertyDescriptor(effectResult, propertyKey)
    },

    defineProperty(_target, propertyKey, descriptor) {
      const effectResult = lazyResult.value
      return Reflect.defineProperty(effectResult, propertyKey, descriptor)
    },

    deleteProperty(_target, propertyKey) {
      const effectResult = lazyResult.value
      return Reflect.deleteProperty(effectResult, propertyKey)
    },

    getPrototypeOf() {
      const effectResult = lazyResult.value
      return Reflect.getPrototypeOf(effectResult)
    },

    setPrototypeOf(_target, newPrototype) {
      const effectResult = lazyResult.value
      return Reflect.setPrototypeOf(effectResult, newPrototype)
    },
  }

  // 注意：如果 doSomething 返回的是 primitive（number/string/boolean），Proxy 没法包它。
  // 这里仍然返回 Proxy（类型层面强转），在运行时需要用户“以对象方式使用”才能触发。
  // 真要支持 primitive 的懒值，需要 LazyBox + Symbol.toPrimitive（可以后续加）。
  return new Proxy(base as any, handler) as any
}
