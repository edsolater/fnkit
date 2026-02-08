import type { AnyClass } from "../typings"
import { mixClasses } from "./mix"

/**
 * Class decorator for mixing multiple classes
 *
 * 命中顺序（优先级）规则：
 * - 被装饰的类优先级最高，会覆盖所有混入类的同名方法
 * - 混入类参数越靠后，优先级越高
 * - 例如 @Part(A, B) class C {}：优先级为 C > B > A
 * - 访问某个方法时：先查找 C，C 没有则查找 B，B 没有则查找 A
 *
 * 注意：由于 TypeScript 的限制，装饰器改变类结构后无法自动推断类型，
 * 使用时需要类型断言 `as any` 来访问混合后的成员。
 *
 * @example
 * class A { method() { return 'A' } }
 * class B { method() { return 'B' } }
 * @Part(A, B)
 * class C { method() { return 'C' } }
 *
 * const instance = new C()
 * instance.method() // 返回 'C'（C 覆盖了 B 和 A）
 * (instance as any).methodFromA() // 访问混入的方法需要类型断言
 *
 * const Ctor = C as any
 * Ctor.staticMemberFromA // 访问静态成员也需要类型断言
 */
export function Part<const Classes extends AnyClass[]>(...bases: Classes) {
  return function <T extends AnyClass>(target: T, _context: ClassDecoratorContext): any {
    // 将目标类和所有基类混合
    return mixClasses(...bases, target)
  }
}
