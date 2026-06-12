# 如何为 fnkit 编写测试

## 目标

测试的第一目标是确认公开 API 的当前行为，并为后续整理 `reference.md` 提供可信资料。

编写测试时需要同步记录 raw reference 信息，但不要急于把 `reference.md` 打磨成最终索引。

## 语言规范

fnkit 当前采用“中文负责描述，英文负责结构”的写法。历史文件中存在全英文注释或英文测试描述，只能说明它们曾经存在，不能作为新测试和新注释的规范。

- `describe`、`test` 的描述使用简体中文。
- 测试文件中的解释性注释使用简体中文。
- 代码注释使用简体中文，并且需要判断是否清楚、自然、优雅；生硬或过时的注释应在当前批次内顺手修正。
- 测试日志、调试说明、错误说明优先使用简体中文。
- 文档说明使用简体中文。
- 变量名、函数名、类型名、import/export 等代码结构使用英文。
- 当变量名本身表达业务含义时，仍使用英文命名，因为它属于代码结构的一部分。
- 约定俗成的代码词汇保持英文，例如 `mapper`、`predicate`、`resolve`、`reject`、`options`。
- 断言中的字符串期望值按函数实际输出保留，不强行翻译。

示例：

```ts
import { describe, expect, test } from "vitest"
import { map } from "./map"

describe("map()", () => {
  test("Array 输入应返回映射后的 Array", () => {
    const result = map([1, 2, 3], (value) => value * 2)
    expect(result).toEqual([2, 4, 6])
    expect(Array.isArray(result)).toBe(true)
  })
})
```

## 文件位置

- 源码文件 `src/foo.ts` 的测试优先放在 `src/foo.test.ts`。
- 目录内聚合导出的函数，可以在同目录建立一个聚合测试文件。
- 跨多个文件的集成行为可以新增集成测试，但不能替代函数级测试。

## 每个公开函数至少覆盖什么

每个公开运行时函数至少需要覆盖：

- 正常输入：最典型的使用方式。
- 边界输入：空值、空集合、零、负数、极大值、非法格式等。
- 输出形状：返回 Array、Set、Map、Object、Iterator、Promise、实例等是否符合预期。
- 关键参数语义：回调参数、key/index、配置项、默认值。
- 错误路径：应抛错时验证错误；不应抛错时验证容错。
- 回归行为：源码注释、历史测试或旧行为暗示的特殊情况。

## 测试分类建议

### collection

- 覆盖 Array / Set / Map / Object / Iterable。
- 验证 key/index 语义。
- 验证返回集合类型。
- 如果实现包含 lazy 行为，验证未访问前不执行、访问后执行、重复访问是否复用结果。

### numberish

- 覆盖 number、string number、BigInt、Fraction 类结构。
- 覆盖小数、负数、零、大数。
- 对精度函数优先断言字符串化结果，避免 JS number 精度干扰。
- `addS`、`multiplyS` 这类字符串包装函数要单独测试输出形状。

### time/date

- 使用固定时间输入，不依赖真实当前时间。
- 测试格式 token、默认格式、时区参数、duration 单位换算。
- 当前时间类函数如 `createCurrentDateTimeStr` 需要使用 fake timers 或只测试形状。

### object

- 明确是否 mutate 输入对象。
- 覆盖 getter/setter、descriptor、prototype、symbol key 等关键对象行为。

### class/instance

- 覆盖构造参数、字段 assign、静态方法调用、实例类型。
- 复杂 class 工具要测试覆盖优先级和错误提示。

### async/promise

- 使用 `async/await`。
- 使用 fake timers 控制时间。
- 验证 resolve、reject、取消、重试次数、并发顺序。

## 禁止事项

- 不写依赖真实网络、真实系统时间、随机结果的测试。
- 不在测试里做性能 benchmark；性能相关只做行为断言。
- 不为了让测试通过而修改源码语义，除非已有明确计划或用户要求。
- 不把语义不清的问题自行拍脑袋定论；记录到 `docs/reference-raw/unresolved-questions.md`。
- 不一次性修改大量文件或大量测试用例。

## 批次节奏

测试补齐必须小批量推进。

单个批次建议上限：

- 最多 1 个源码文件；或
- 最多 5 个强相关公开函数；或
- 最多 20 个新增/修改测试用例。

每个批次结束后必须：

1. 运行相关测试。
2. 必要时运行 `bun run type-check`。
3. 更新 raw reference。
4. 汇报本批次完成了哪些测试和文档。
5. 等使用者确认“继续”后再进入下一批。

执行模型不要自动连续推进多个批次。

## 与 raw reference 的同步

每补一个文件或一组函数测试，都要同步更新对应 raw reference 文档。

raw reference 记录的是“测试和源码确认过的原信息”，不是最终 `reference.md`。

建议记录：

- 函数名和源码链接。
- 轻量形状。
- 当前行为。
- 参数语义。
- 返回值形状。
- 边界行为。
- 测试覆盖清单。
- 可疑点或待确认问题。

如果测试中发现行为和注释不一致，先写测试确认当前行为，再把冲突记录到 unresolved 文档。

## 验证命令

每批测试完成后至少运行：

```bash
bun test
bun run type-check
```

如果改动影响导出、类型或构建，还需要运行：

```bash
bun run build
```
