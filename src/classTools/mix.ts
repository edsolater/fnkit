import { bindThisIfFunction } from "../bindThisIfFunction"
import type { AnyClass } from "../typings/constants"
import type { Intersect, MapInvoke, ToInstance } from "../typings/recursiveTools"

// 混合类的类型：静态成员 + 构造函数
type MixedClassType<Classes extends AnyClass[]> = Intersect<Classes> & {
  new (...args: any[]): Intersect<MapInvoke<Classes, ToInstance>>
}

/**
 * 合并多个类为一个类
 *
 * 使用 Proxy + 预计算的混合方案：
 * - 实例方法直接复制到 prototype（性能优、DevTools 可见）
 * - 静态成员通过 Proxy + Map 精确查找（避免重复遍历）
 * - 所有类的构造函数都会在实例化时调用，状态共享在同一个实例上
 * - 支持私有字段（每个类的方法保持自己的访问权限）
 *
 * 命中顺序（优先级）规则：
 * - 参数越靠后的类，优先级越高
 * - 后面的类会覆盖前面类的同名方法和属性
 * - 例如 mix(A, B, C)：优先级为 C > B > A
 * - 访问某个方法时：先查找 C，C 没有则查找 B，B 没有则查找 A
 *
 * @example
 * class A { method() { return 'A' } }
 * class B { method() { return 'B' } }
 * const Mixed = mix(A, B)
 * new Mixed().method() // 返回 'B'（B 覆盖了 A）
 */
export function mixClasses<const Classes extends AnyClass[]>(...bases: Classes): MixedClassType<Classes> {
  if (bases.length === 0) return class {} as any
  if (bases.length === 1) return bases[0] as any

  // 预计算：收集所有静态成员的映射关系（避免运行时重复遍历）
  const staticMemberMap = new Map<string | symbol, AnyClass>()
  const allStaticKeys = new Set<string | symbol>()

  // 正序遍历，后者覆盖前者（符合 JavaScript 约定：越后面优先级越高）
  for (const Base of bases) {
    Reflect.ownKeys(Base).forEach((key) => {
      // 跳过构造函数的特殊属性
      if (key === "prototype" || key === "length" || key === "name") return
      staticMemberMap.set(key, Base) // 后者覆盖前者
      allStaticKeys.add(key)
    })
  }

  // 创建混合类
  class MixedClass {
    constructor(...args: any[]) {
      // 依次调用所有基类的构造函数，让它们初始化同一个 this
      // 这样所有状态都共享在同一个实例上，各个类的方法可以互相访问公共属性
      bases.forEach((Base) => {
        Base.call(this, ...args)
      })
    }
  }

  // 实例方法：直接复制到 prototype（性能最优，DevTools 友好）
  // 正序遍历，后者覆盖前者（符合 JavaScript 约定：越后面优先级越高）
  for (const Base of bases) {
    for (const key of Reflect.ownKeys(Base.prototype)) {
      if (key === "constructor") continue // constructor 是特殊属性，应该始终指向当前类，不应该被复制。
      const descriptor = Object.getOwnPropertyDescriptor(Base.prototype, key)!
      Object.defineProperty(MixedClass.prototype, key, descriptor)
    }
  }

  // 冻结原型，禁止运行时修改
  Object.freeze(MixedClass.prototype)

  // 静态成员：使用 Proxy + Map 精确查找
  return new Proxy(MixedClass, {
    get(target, key) {
      // 特殊属性直接返回
      if (Reflect.has(target, key)) return Reflect.get(target, key)

      // 从 Map 中精确查找静态成员（O(1) 复杂度）
      if (staticMemberMap.has(key)) {
        const sourceClass = staticMemberMap.get(key)!
        const value = sourceClass[key]
        return bindThisIfFunction(value, sourceClass)
      }

      return target[key]
    },

    set(target, key, value) {
      if (key === "prototype") {
        throw new Error(
          `Cannot modify prototype of mixed class. The prototype has been frozen to prevent runtime modifications.`,
        )
      }
      if (staticMemberMap.has(key)) {
        throw new Error(
          `Cannot modify static member "${String(key)}" from original class "${staticMemberMap.get(key)?.name}". Static members are read-only after mixing.`,
        )
      }
      return Reflect.set(target, key, value) // 允许设置新的静态成员
    },

    has(target, key) {
      return allStaticKeys.has(key) || key in target
    },

    ownKeys(target) {
      return [...allStaticKeys, ...Reflect.ownKeys(target)]
    },

    getOwnPropertyDescriptor(target, key) {
      if (staticMemberMap.has(key)) {
        const sourceClass = staticMemberMap.get(key)!
        return Object.getOwnPropertyDescriptor(sourceClass, key)
      }
      return Object.getOwnPropertyDescriptor(target, key)
    },

    construct(target, args) {
      return Reflect.construct(target, args)
    },
  }) as any
}
