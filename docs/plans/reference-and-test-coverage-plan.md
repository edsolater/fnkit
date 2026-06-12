# fnkit 函数索引与测试补齐计划

## 目标

为 fnkit 建立一个 AI 友好的函数发现入口，并补齐公开函数的单元测试。

本计划只定义策略、格式、执行顺序和验收方法；不直接实施源码、测试或 reference 的完整补齐。

当前优先级：

1. 补齐公开 API 的测试。
2. 在补测试时同步提取 raw reference 原信息。
3. 后续再从 raw reference 中提炼最终 `reference.md`。

执行节奏约束：

- 不能一次性修改大量文件或大量测试。
- 每个批次最多处理 1 个源码文件、5 个强相关公开函数或 20 个新增/修改测试用例。
- 每批次完成后必须运行相关测试，更新 raw reference，并向使用者汇报。
- 使用者确认继续后，才进入下一批次。

具体批次开始、执行、验证、汇报和恢复流程见 [`docs/plans/batch-execution-protocol.md`](./batch-execution-protocol.md)。

## 背景判断

- `README.md` 只做项目入口，不承载完整函数索引。
- `reference.md` 是最终扁平函数索引，不按当前目录结构做语义分组。
- `docs/reference-raw/*.md` 是测试阶段沉淀的原始资料，不是最终索引。
- 目录路径只表示源码位置，不表示函数归属。
- 函数语义以函数本身为单位描述；未来可以迁移到 namespace，但不依赖当前目录结构。
- 函数的精确定义以源码签名和 JSDoc/TSDoc 为准。
- 每个公开文件或公开方法都应该有对应测试；当前测试覆盖不完整。
- 当前语言规范是“中文负责描述，英文负责结构”；历史英文注释和英文测试描述不能作为新规范。

## 文档分层

| 层级 | 文件 | 责任 |
| --- | --- | --- |
| 入口 | `README.md` | 告诉使用者和 AI 去看 `reference.md`。 |
| 索引 | `reference.md` | 扁平列出公开函数：函数名、形状、用途、标签、源码链接。 |
| 原始资料 | `docs/reference-raw/*.md` | 在写测试时记录源码和测试确认过的行为。 |
| 精确定义 | `src/**/*.ts` JSDoc/TSDoc | 写参数语义、返回值、边界条件、示例、函数间 `{@link}` 关系。 |
| 测试 | `src/**/*.test.ts` | 验证公开行为、边界条件、类型意图和回归风险。 |

## reference.md 格式

推荐字段：

| 字段 | 含义 | 要求 |
| --- | --- | --- |
| 函数 | Markdown 链接到源码文件 | 不写行号；函数名使用反引号。 |
| 形状 | 轻量输入输出形态 | 不追求完整 TS 类型，强调 `输入 -> 输出`。 |
| 用途 | 一句短语说明函数做什么 | 不能写实现细节；不能依赖标签才能理解。 |
| 标签 | 搜索辅助词 | 用于 AI 搜索和横向过滤，不代替用途。 |

示例：

```md
| [`map`](./src/collectionMethods/map.ts) | `Collection<T>, mapper -> Collection<R>` | 统一映射集合元素值。 | `collection` `map` `lazy` |
| [`formatDate`](./src/timeTools/stringifyDate.ts) | `DateLike, format -> string` | 按格式字符串输出日期文本。 | `date` `format` `string` |
| [`add`](./src/numberish/operations.ts) | `Numberish, Numberish -> Numberish` | 精度友好地执行加法。 | `numberish` `math` `exact` |
```

## raw reference 格式

raw reference 存放在 `docs/reference-raw/`，用于记录测试阶段收集到的原始信息。

它应该比 `reference.md` 更详细，可以包含：

- 源码链接和测试链接。
- 轻量输入输出形状。
- 当前行为。
- 参数语义。
- 返回值形状。
- 边界行为。
- 测试覆盖项。
- 注释和实现冲突。
- 待确认问题。

详细模板见 [`docs/reference-raw/README.md`](../reference-raw/README.md)。

如果执行模型遇到无法判断的问题，记录到 [`docs/reference-raw/unresolved-questions.md`](../reference-raw/unresolved-questions.md)。

## 标签策略

标签服务搜索，不服务解释。AI 写代码时更可能搜索“领域词、动作意图、约束词、输出形式”。

标签类型：

| 类型 | 示例 | 使用规则 |
| --- | --- | --- |
| 领域词 | `date`、`duration`、`numberish`、`collection`、`object`、`class`、`function`、`promise`、`event`、`tree` | 帮 AI 缩小问题领域。 |
| 动作意图 | `format`、`parse`、`convert`、`normalize`、`validate`、`compare`、`merge`、`clone`、`pick`、`omit`、`group`、`map`、`filter`、`reduce`、`compose`、`pipe` | 对应“我要做什么”。 |
| 约束特征 | `lazy`、`typed`、`exact`、`safe`、`async`、`sync`、`abortable`、`readonly`、`memoized` | 形状和用途看不出的关键行为。 |
| 输出形式 | `string`、`number`、`boolean`、`array`、`object`、`map`、`set`、`iterator`、`promise`、`instance` | 只有当输出形式对搜索有价值时使用。 |

不推荐标签：

- 不使用当前目录名作为标签，除非它也是稳定领域词。
- 不使用过细的一次性标签。
- 不使用必须读源码才能理解的内部实现标签。
- `factory` 这类形状性标签优先用形状字段表达，例如 `Class, Args -> Instance`；只有搜索价值明确时再保留。

## JSDoc/TSDoc 策略

每个公开函数需要有源码级说明，优先使用 TSDoc/JSDoc。

注释语言规则：

- 描述性内容使用简体中文。
- `{@link}`、函数名、参数名、类型名等代码结构保持英文。
- 注释需要清楚、自然、优雅；生硬直译、无信息量或过时注释应在对应批次内修正。
- 如果注释和实现冲突，先记录到 raw reference 的待确认问题，不由执行模型自行定论。

必写内容：

- 一句话精确定义。
- 参数语义，尤其是容易误解的参数。
- 返回值语义。
- 关键边界条件。
- 至少一个最小示例。
- 易混函数使用 `{@link otherFunction}` 关联。

示例结构：

```ts
/**
 * 按格式字符串输出日期文本。
 *
 * 需要快速输出默认日期时间字符串时可使用 {@link toDateString}。
 *
 * @param inputDate 可被 createDate 解析的日期值。
 * @param formatString 日期格式字符串，默认 `YYYY-MM-DD HH:mm:ss`。
 * @returns 格式化后的日期字符串。
 *
 * @example
 * formatDate("2020-08-24 18:54", "YYYY-MM-DD HH:mm:ss")
 */
export function formatDate(...)
```

## 测试补齐范围

公开 API 的判定来源：

1. `src/index.ts` 直接或间接 `export *` 暴露的文件。
2. 各级 `index.ts` 再导出的文件。
3. 源文件中 `export function`、`export const`、`export class`、`export type` 中具有运行时行为的公开项。
4. 类型工具不要求运行时测试，但需要在可行时增加类型约束测试或构建验证。

测试文件位置：

- 优先与源码同目录：`src/foo.ts` 对应 `src/foo.test.ts`。
- 多函数文件可以一个测试文件覆盖多个导出。
- 跨模块行为可以新增集成测试，但不替代函数级测试。

## 测试设计原则

每个公开函数至少覆盖：

- 正常路径：最典型输入输出。
- 边界路径：空值、空集合、零、负数、极大值、无效格式等。
- 类型/形状保持：输入输出集合类型、实例类型、Promise/Iterator 形态。
- 错误路径：应抛错时验证错误；不应抛错时验证容错。
- 回归点：源码注释、历史测试或现有实现暗示的特殊行为。

不同类别的测试重点：

| 类别 | 测试重点 |
| --- | --- |
| collection | Array / Set / Map / Object / Iterable 的输入输出形态，key/index 语义，大集合 lazy 行为。 |
| numberish | 大数、小数、负数、字符串数值、BigInt、精度保持、字符串输出。 |
| time/date | 时区、格式 token、duration 单位、非法时间标签、默认格式。 |
| object | 原型、descriptor、getter/setter、浅/深行为、是否 mutate。 |
| function pipeline | 执行顺序、类型链路、空函数列表、异步版本行为。 |
| class/instance | 构造参数、静态方法代理、实例方法、覆盖优先级、错误提示。 |
| async/promise | resolve/reject、并发、取消、重试次数、时间控制。 |

## 执行阶段

### 阶段 1：公开 API 清点

产物：

- 生成或手工维护公开导出清单。
- 标出每个公开项是否已有 `reference.md` 条目。
- 标出每个公开项是否已有测试文件和测试用例。

建议清点字段：

```md
| 导出项 | 源码文件 | 是否运行时 API | reference | test | 备注 |
```

验收：

- `src/index.ts` 可达的公开运行时 API 全部出现在清单中。
- 清单能区分“无需测试的类型导出”和“必须测试的运行时导出”。

### 阶段 2：补测试并同步提取 raw reference

产物：

- 新增或补充 `src/**/*.test.ts`。
- 新增或补充 `docs/reference-raw/*.md`。
- 将语义不清、疑似 bug、注释冲突记录到 `docs/reference-raw/unresolved-questions.md`。

执行规则：

1. 每批只处理 1 个源文件或 2 到 5 个强相关函数。
2. 先用测试确认当前行为。
3. 再把行为、形状、参数语义、边界和测试覆盖记录到 raw reference。
4. 不在本阶段大规模改 `reference.md`。
5. 每批最多新增或修改 20 个测试用例。
6. 每批完成后停止，等待使用者确认继续。

验收：

- 本批次新增测试通过。
- 本批次涉及的公开函数有 raw reference 记录。
- 不确定问题已记录，未被执行模型擅自定论。

详细执行指南见 [`docs/plans/codex-spark-test-and-raw-reference-guide.md`](./codex-spark-test-and-raw-reference-guide.md)。

批次硬约束见 [`docs/plans/batch-execution-protocol.md`](./batch-execution-protocol.md)。

### 阶段 3：确定 reference 规范

产物：

- 固定 `reference.md` 表格字段：`函数 / 形状 / 用途 / 标签`。
- 固定标签列表和标签命名规则。
- 先保留少量已写样例，确认格式后批量补全。

验收：

- 每条索引都能单独回答“它大概干什么”。
- 形状字段能表达输入输出关系。
- 标签不代替用途，只用于搜索。
- 不出现目录归属式标题。

### 阶段 4：从 raw reference 批量补 reference

执行顺序：

1. 优先使用已测试且 raw reference 完整的函数。
2. 再补核心高频工具：collection、numberish、timeTools、objectUtils、functionManagers。
3. 最后补旧方法、低频结构、内部兼容导出。

验收：

- 每个公开运行时 API 有一条 reference。
- 链接均指向存在的源码文件。
- 用途短语不超过一行优先；必要时仍保持高密度。

### 阶段 5：补 JSDoc/TSDoc

执行顺序：

1. 先补 reference 中用途不够自解释的函数。
2. 再补重载函数、行为复杂函数、容易误用函数。
3. 最后补简单包装函数。

验收：

- 公开函数有一句精确定义。
- 复杂函数有 `@example`。
- 易混函数使用 `{@link}`。
- 过时函数使用 `@deprecated` 指向替代函数。

### 阶段 6：补剩余单元测试

执行顺序：

1. 先补无测试文件的公开运行时文件。
2. 再补已有测试但缺边界的文件。
3. 再补类型推导和重载行为。
4. 最后补回归测试和历史兼容行为。

验收：

- 每个公开运行时文件至少有一个对应测试文件。
- 每个公开运行时函数至少有一个直接测试用例或同文件聚合测试用例。
- 复杂函数覆盖正常、边界、错误路径。
- 所有测试可重复运行，不依赖真实时间或外部网络；需要时间时使用 fake timers 或可控输入。

### 阶段 7：自动化检查

需要的检查：

- `bun run type-check`
- `bun run build`
- `bun test`
- reference 链接检查：所有 Markdown 链接目标文件存在。
- coverage 清点检查：公开运行时 API 与 reference/test 清单对齐。

验收：

- 类型检查通过。
- 构建通过。
- 全量测试通过。
- 清点脚本或清单显示无遗漏公开运行时 API。

## 建议新增脚本

后续可以新增脚本辅助验收：

```txt
scripts/audit-public-api.ts
scripts/audit-reference-links.ts
scripts/audit-test-coverage.ts
```

脚本职责：

- 从 `src/index.ts` 递归收集公开导出。
- 解析 `reference.md` 中的函数链接和函数名。
- 检查源码文件是否存在同名或聚合测试。
- 输出缺失 reference、缺失测试、链接失效、重复条目。

脚本只做审计，不自动修改源码。

## 完成标准

整体完成需要同时满足：

- `README.md` 明确指向 `reference.md`。
- `docs/reference-raw/` 已沉淀公开 API 的原始行为资料。
- `reference.md` 覆盖所有公开运行时 API。
- `reference.md` 使用扁平索引，不按目录做语义分组。
- 每个公开运行时 API 有源码 JSDoc/TSDoc 或足够明确的近邻说明。
- 每个公开运行时 API 有对应单元测试。
- `bun run type-check`、`bun run build`、`bun test` 全部通过。
- 审计清单显示 reference 和测试无遗漏。

## 风险与处理

| 风险 | 处理 |
| --- | --- |
| 一次性补全范围过大 | 按导出层级和目录批次推进，每批独立验收。 |
| reference 变成长篇说明 | 用“形状 + 用途 + 标签”限制信息密度，详细内容放源码 JSDoc。 |
| 标签膨胀失控 | 先维护标签列表，新标签必须能服务搜索。 |
| 旧函数语义不清 | 先写当前行为测试，再决定是否改名、废弃或补说明。 |
| 测试锁死错误行为 | 对明显 bug 先记录，区分“当前行为测试”和“目标行为测试”。 |
| 时间/异步测试不稳定 | 使用 fake timers、可控 promise、明确超时，不依赖真实等待。 |

## 下一步建议

先执行阶段 1，生成公开 API 清点表。清点表确认后，再按小批次补 reference、JSDoc 和测试。
