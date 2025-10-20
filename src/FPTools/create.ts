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
