import { isFunction, isObject } from ".."
import type { AnyObj } from "../typings"

type Op =
  | { kind: "set"; path: PropertyKey[]; value: any }
  | { kind: "delete"; path: PropertyKey[] }
  | { kind: "define"; path: PropertyKey[]; desc: PropertyDescriptor }

function isObjectOrFunction(x: any): x is object {
  return isObject(x) || isFunction(x)
}

function isPlainObjectOrArray(x: any) {
  return Array.isArray(x) || (x && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype)
}

function shallowClone<T>(x: T): T {
  if (Array.isArray(x)) return x.slice() as any
  if (x && typeof x === "object") return { ...(x as any) }
  return x
}

function getIn(base: any, path: PropertyKey[]) {
  let cur = base
  for (const k of path) {
    if (!isObjectOrFunction(cur)) return undefined
    cur = (cur as any)[k]
  }
  return cur
}

/**
 * Copy-on-write set：沿 path 克隆链路节点，最后写入 value
 */
function setInCOW(base: any, path: PropertyKey[], value: any) {
  if (path.length === 0) return value

  const root = shallowClone(base)
  let curNew: any = root
  let curOld: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const oldChild = isObjectOrFunction(curOld) ? curOld[key] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : typeof path[i + 1] === "number" ? [] : {}
    curNew[key] = newChild
    curNew = newChild
    curOld = oldChild
  }

  curNew[path[path.length - 1]] = value
  return root
}

function deleteInCOW(base: any, path: PropertyKey[]) {
  if (path.length === 0) return base
  const root = shallowClone(base)
  let curNew: any = root
  let curOld: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const oldChild = isObjectOrFunction(curOld) ? curOld[key] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : typeof path[i + 1] === "number" ? [] : {}
    curNew[key] = newChild
    curNew = newChild
    curOld = oldChild
  }

  const last = path[path.length - 1]
  if (Array.isArray(curNew) && typeof last === "number") {
    // 数组 delete 下标会产生 hole，这里按你预期选择：真的 delete
    delete curNew[last]
  } else {
    delete curNew[last]
  }
  return root
}

function defineInCOW(base: any, path: PropertyKey[], desc: PropertyDescriptor) {
  if (path.length === 0) return base
  const root = shallowClone(base)
  let curNew: any = root
  let curOld: any = base

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const oldChild = isObjectOrFunction(curOld) ? curOld[key] : undefined
    const newChild = isObjectOrFunction(oldChild) ? shallowClone(oldChild) : {}
    curNew[key] = newChild
    curNew = newChild
    curOld = oldChild
  }

  Object.defineProperty(curNew, path[path.length - 1], desc)
  return root
}

/**
 * 基于 patch 的“读”：如果某个路径被 set/delete/define 过，读到最新语义
 * 这里用一个 map 做“最后写入覆盖”，保证 draft 内部读到自己写过的值
 */
function buildLastWriteMap(ops: Op[]) {
  const m = new Map<string, Op>()
  const keyOf = (path: PropertyKey[]) => path.map(String).join("\u0000")
  for (const op of ops) {
    m.set(keyOf(op.path), op)
  }
  return { m, keyOf }
}

function applyOps(base: any, ops: Op[]) {
  let out = base
  for (const op of ops) {
    if (op.kind === "set") out = setInCOW(out, op.path, op.value)
    else if (op.kind === "delete") out = deleteInCOW(out, op.path)
    else out = defineInCOW(out, op.path, op.desc)
  }
  return out
}

function createDraft(base: any, ops: Op[]) {
  // 缓存同一路径的 proxy，避免重复创建
  const proxyCache = new Map<string, any>()
  const { m: lastMap, keyOf } = buildLastWriteMap(ops)

  const make = (path: PropertyKey[]): any => {
    const cacheKey = keyOf(path)
    if (proxyCache.has(cacheKey)) return proxyCache.get(cacheKey)

    const p = new Proxy({} as any, {
      get(_t, prop) {
        // 读自己写过的值
        const op = lastMap.get(keyOf([...path, prop]))
        if (op?.kind === "set") return op.value
        if (op?.kind === "delete") return undefined

        const v = getIn(base, [...path, prop])
        // 深层对象继续返回 draft proxy，实现 deep 写入收集
        if (isObjectOrFunction(v) && (isPlainObjectOrArray(v) || typeof v === "function")) {
          return make([...path, prop])
        }
        return v
      },

      set(_t, prop, value) {
        const op: Op = { kind: "set", path: [...path, prop], value }
        ops.push(op)
        lastMap.set(keyOf(op.path), op)
        return true
      },

      deleteProperty(_t, prop) {
        const op: Op = { kind: "delete", path: [...path, prop] }
        ops.push(op)
        lastMap.set(keyOf(op.path), op)
        return true
      },

      defineProperty(_t, prop, desc) {
        const op: Op = { kind: "define", path: [...path, prop], desc }
        ops.push(op)
        lastMap.set(keyOf(op.path), op)
        return true
      },

      has(_t, prop) {
        const op = lastMap.get(keyOf([...path, prop]))
        if (op?.kind === "delete") return false
        if (op) return true
        const v = getIn(base, [...path, prop])
        return v !== undefined
      },

      ownKeys() {
        // 简化：不把 delete/define/set 全并进去（需要的话可以做）
        const v = getIn(base, path)
        return isObjectOrFunction(v) ? Reflect.ownKeys(v) : []
      },

      getOwnPropertyDescriptor(_t, prop) {
        const op = lastMap.get(keyOf([...path, prop]))
        if (op?.kind === "delete") return undefined
        if (op?.kind === "define") return op.desc
        if (op?.kind === "set") {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: op.value,
          }
        }
        const v = getIn(base, [...path])
        return isObjectOrFunction(v) ? Object.getOwnPropertyDescriptor(v, prop) : undefined
      },
    })

    proxyCache.set(cacheKey, p)
    return p
  }

  return make([])
}

/**
 * 更改对象，但是不执行：返回一个 Proxy，推迟到“使用”返回值时才执行 doSomething 并产出新对象。
 *
 * - 当你第一次读取属性 / in / Object.keys / 调用原型方法时，会 materialize
 * - doSomething 在 materialize 内部运行，拿到的是 draftProxy（只收集写入，不改 base）
 */
export function lazyDo<O extends AnyObj>(base: O, doSomething: (draft: O) => void): O
export function lazyDo<O extends AnyObj, U>(base: O, doSomething: (draft: O) => U): U
export function lazyDo(base: AnyObj, doSomething: (draft: AnyObj) => any) {
  let materialized = false
  let result: any
  const ops: Op[] = []

  const materialize = () => {
    if (materialized) return result
    materialized = true

    const draft = createDraft(base, ops)
    const ret = doSomething(draft)

    // 如果用户返回了一个“新根对象”，你可以选择：
    // A) 忽略 ops，直接用 ret
    // B) 对 ret 再 apply ops（通常没必要）
    // 这里选择：如果 ret 是对象就直接用 ret，否则用 applyOps(base, ops)
    if (isObjectOrFunction(ret)) {
      result = ret
    } else {
      result = applyOps(base, ops)
    }
    return result
  }

  const wrapFn = (fn: Function) =>
    function (this: any, ...args: any[]) {
      const obj = materialize()
      // 关键：方法调用的 this 应该是“产物对象”
      return Reflect.apply(fn, obj, args)
    }

  const handler: ProxyHandler<any> = {
    get(_t, prop, _r) {
      // 读属性就算“使用”，触发 materialize
      const obj = materialize()
      const v = Reflect.get(obj, prop, obj)
      // 原型链方法：调用才算真正使用 —— 但你要求“读到方法也触发”，这里已经触发了
      // wrap 的意义是：确保 this 指向产物对象
      if (typeof v === "function") return wrapFn(v)
      return v
    },

    set(_t, prop, value) {
      const obj = materialize()
      return Reflect.set(obj, prop, value, obj)
    },

    has(_t, prop) {
      const obj = materialize()
      return Reflect.has(obj, prop)
    },

    ownKeys() {
      const obj = materialize()
      return Reflect.ownKeys(obj)
    },

    getOwnPropertyDescriptor(_t, prop) {
      const obj = materialize()
      return Object.getOwnPropertyDescriptor(obj, prop)
    },

    defineProperty(_t, prop, desc) {
      const obj = materialize()
      return Reflect.defineProperty(obj, prop, desc)
    },

    deleteProperty(_t, prop) {
      const obj = materialize()
      return Reflect.deleteProperty(obj, prop)
    },

    getPrototypeOf() {
      const obj = materialize()
      return Reflect.getPrototypeOf(obj)
    },

    setPrototypeOf(_t, proto) {
      const obj = materialize()
      return Reflect.setPrototypeOf(obj, proto)
    },
  }

  // 注意：如果 doSomething 返回的是 primitive（number/string/boolean），Proxy 没法包它。
  // 这里仍然返回 Proxy（类型层面强转），在运行时需要用户“以对象方式使用”才能触发。
  // 真要支持 primitive 的懒值，需要 LazyBox + Symbol.toPrimitive（可以后续加）。
  return new Proxy({}, handler) as any
}
