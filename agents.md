# Agents 开发规范

本文档记录 fnkit 项目中与 AI/人类协作相关的开发约定和规范。

## 工具链约定

### Bun 优先（强制）

**强制约定：项目统一使用 Bun，不使用 npm、node、ts-node、pnpm 作为日常开发与执行入口。**

- 依赖安装：使用 `bun install`
- 脚本执行：使用 `bun run <script>`
- 直接执行 TS/JS：优先 `bun <file>`
- 单次命令：优先 `bunx <command>`

### 禁止项

- 禁止使用 `npm install` / `npm run`
- 禁止使用 `pnpm install` / `pnpm run`
- 禁止以 `node`、`ts-node` 作为默认执行入口

### 迁移说明

- 发现历史文档或脚本示例仍为 npm/pnpm/node/ts-node 时，应同步改为 Bun 写法
- AI 生成命令时，默认输出 Bun 命令，不再给出 npm/pnpm 等平行方案

## 代码注释规范

### 基本原则

1. **人类可读为第一要义** - 注释必须自然、流畅、易读
2. **AI友好为辅助目标** - 好的人类注释自然对AI也清晰
3. **简洁精准** - 去除冗余，突出关键信息
4. **利用类型系统** - TS已有类型签名，注释不重复类型信息

### 注释格式

#### 1. JSDoc 注释结构

```typescript
/**
 * 中文描述（简洁、关键信息前置）
 * English description
 *
 * 补充说明（可选）
 * Additional notes
 *
 * @param paramName - 中文说明 / English description
 * @returns 返回值说明 / Return value description
 * @throws 异常说明 / Exception description
 *
 * @example 示例标题（中文 + 英文括号）
 * code example here
 * // 不使用代码块包裹
 */
```

#### 2. 注释语言顺序

**强制约定：中文在前，英文在后**

```typescript
// ✅ 正确
/**
 * 可组合的匹配模式类
 * Pattern matching class for type-safe pattern matching
 */

// ❌ 错误
/**
 * Pattern matching class for type-safe pattern matching
 * 可组合的匹配模式类
 */
```

#### 3. @example 格式

示例标题直接跟在 `@example` 后，中文主标题，英文在括号中：

```typescript
/**
 * @example 组合模式（composing patterns）
 * const pattern = startsWith('http').and(includes('github'))
 * pattern.test('https://github.com') // true
 */
```

**禁止使用：**

```typescript
// ❌ 错误：不要用代码块包裹
/**
 * @example
 * 组合模式
 * ```
 * code here
 * ```
 */

// ❌ 错误：英文在前
/**
 * @example Composing patterns（组合模式）
 */
```

#### 4. 注释简洁原则

- **去除类型信息** - 类型由TS签名表达
- **突出关键行为** - 如"返回新实例"、"短路求值"等
- **避免冗余词汇** - 如"用于"、"通过"、"进行"等

```typescript
// ✅ 好
/**
 * AND组合，返回新实例
 * Create a new pattern that matches if both patterns match
 */
and(other: Pattern<T>): Pattern<T>

// ❌ 不好（类型冗余）
/**
 * and(other) => Pattern<T> - AND逻辑组合
 */
and(other: Pattern<T>): Pattern<T>
```

### 信息优先级

注释应按此顺序组织信息：

1. **核心用途** - 这是什么/做什么
2. **关键行为** - 重要的特性（如不可变性）
3. **参数说明** - 输入要求
4. **返回/异常** - 输出和边界情况
5. **示例** - 典型用法

## 代码风格约定

### 函数式优先

**约定：优先使用静态工厂方法代替 `new` 关键字**

```typescript
// ✅ 推荐
const pattern = Pattern.of(fn, label)

// ❌ 避免（除了类内部）
const pattern = new Pattern(fn, label)
```

**原因：**
- `new` 是面向对象风格，阅读时有心理摩擦
- 静态工厂方法更符合函数式编程风格
- 代码流更顺畅

**实现方式：**

```typescript
export class Pattern<T> {
  constructor(matchRule: (v: T) => boolean, label?: string) {
    // 内部实现
  }

  // 静态工厂方法
  static of<T>(matchRule: (v: T) => boolean, label?: string): Pattern<T> {
    return new Pattern(matchRule, label)
  }
}
```

### 命名约定

- 类名：`PascalCase`
- 函数/变量：`camelCase`
- 常量：尽量 `camelCase`，特殊情况用 `UPPER_SNAKE_CASE`
- 类型/接口：`PascalCase`

## 开发流程约定

### 1. 修改前先理解

- 阅读相关代码和注释
- 理解设计意图和约束
- 考虑影响范围

### 2. 保持一致性

- 遵循现有代码风格
- 保持注释格式统一
- 维护测试覆盖

### 3. 增量修改

- 小步快跑，及时验证
- 每次修改后运行类型检查
- 确保测试通过

## 本文档的维护

- 新增重要约定时更新此文档
- 定期回顾和优化规范
- 保持文档与实践同步

---

**最后更新：** 2026-02-13  
**维护者：** 项目核心贡献者及 AI 协作者
