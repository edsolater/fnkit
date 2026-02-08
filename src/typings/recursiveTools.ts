/**
 * [协议] 类型函数
 * 
 * 所有的原子逻辑（如 ToInstance）都必须“实现”这个接口。
 * input 是输入的占位符，output 是计算结果。
 */
export interface TypeFn {
  input: unknown
  output: unknown
}


/**
 * [类型函数] ToInstance
 * 
 * 实现了 TypeFn 协议。
 * 逻辑：this['input'] 是构造函数吗？是 -> 取实例; 否 -> never。
 */
export interface ToInstance extends TypeFn {
  output: this["input"] extends new (...args: any[]) => infer R ? R : never
}

/**
 * [操作] 调用类型函数 
 * 
 * 作用：执行一个逻辑单元。把 Arg 填入 F 的 input，拿出 output。
 * 类似于函数调用 F(Arg)。
 */
export type InvokeTypeFn<F extends TypeFn, Arg> = (F & { input: Arg })["output"]

/**
 * [批量操作] 批量类型调用
 * 作用：遍历元组 T，对每一项应用逻辑 F。
 * 命名：Map tuple BY logic.
 *
 * @example
 * MapInvoke<[ClassA, ClassB], ToInstance> -> [InstanceA, InstanceB]
 */
export type MapInvoke<T extends any[], F extends TypeFn> = {
  [K in keyof T]: InvokeTypeFn<F, T[K]>
}

/**
 * 🔗 [类型聚合] [类型工具函数] IntersectionFrom
 * 作用：从列表推导出交叉集。
 * 命名：Intersection FROM list.
 *
 * @example
 * IntersectionFrom<[A, B]> -> A & B
 */
export type Intersect<List extends any[]> = List extends [infer Head, ...infer Tail]
  ? Head & Intersect<Tail>
  : unknown
