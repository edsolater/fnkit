import { assert } from "../oldMethodsMagic"
import { AnyClass, type AnyArr } from "../typings/baseTypes"
/**
 * 声明式构造函数。
 * 基于 `Reflect.construct`，语义等价于 `new Target(...args)`，
 * 但以函数式方式调用，更适合 DSL 与高阶函数场景。
 * 让“创建对象”成为表达意图的动作，而非命令。
 *
 * 用于统一构造语义（如 `create(Task)` 或 `create(User, name)`），
 * 保持代码声明性与类型安全（自动推导参数与返回类型）。
 *
 * @param Target 要实例化的类
 * @param args 构造参数
 * @returns 类实例（类型安全）
 */
export function create<T extends abstract new (...args: any[]) => any>(
  Target: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return Reflect.construct(Target, args)
}

/**
 * 由static函数 `Class.from()` 创建，代表 **转换**。
 *
 * 示例：`to(User, {name: "Alice", age: 30})` 通过 data 转换成 User 实例. Date本身已经可以表达自身，to只是换了一种内容的包装壳
 *
 */
export function to<Params extends AnyArr>(cla: AnyClass & { from: (...args: Params) => any }, ...args: Params) {
  assert("from" in cla, `Class ${cla.name} must have a static from() method`)
  return cla.from(...args)
}

/**
 * 由static函数 `Class.of()` 创建，代表 **构造**：组成值形成 Target 实例。
 * 
 * 示例：`make(User, name, age)` 通过 name 和 age 构造 User 实例。单独的name和age不足以表达自己， make上他们包装组合在一起
 */
export function make<Params extends AnyArr>(cla: AnyClass & { of: (...args: Params) => any }, ...args: Params) {
  assert("of" in cla, `Class ${cla.name} must have a static of() method`)
  return cla.of(...args)
}


/**
 * 复杂对象的装配方法
 * 
 * 由static函数 `Class.build()` 创建，代表 **装配(由高级蓝图或配置表)**：加工成 Target 实例。
 * 
 * 示例：`build(Car, config)` 通过配置表构造 Car 实例。配置表只是一份清单描述实例需要根据这份清单生产自己
 */
export function build<Params extends AnyArr>(cla: AnyClass & { build: (...args: Params) => any }, ...args: Params) {
  assert("build" in cla, `Class ${cla.name} must have a static build() method`)
  return cla.build(...args)
}