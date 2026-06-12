# raw reference 说明

## 目的

这里存放 fnkit 公开函数的原始语义资料。

raw reference 不是最终索引，也不是对外文档。它的作用是在补测试时同步记录“源码和测试确认过的函数行为”，后续再从这里提炼出更适合 AI 搜索的 `reference.md`。

## 与 reference.md 的关系

| 文档 | 作用 |
| --- | --- |
| `docs/reference-raw/*.md` | 原始资料，允许详细、允许记录不确定点。 |
| `reference.md` | 最终索引，高密度、扁平、便于 AI 搜索。 |
| `src/**/*.ts` JSDoc/TSDoc | 函数精确定义、参数、边界、示例。 |

## 文件拆分建议

文件拆分只是为了控制文档大小，不代表函数语义归属。

建议先按维护批次拆分：

- `collectionMethods.md`
- `numberish.md`
- `timeTools.md`
- `objectUtils.md`
- `functionTools.md`
- `classAndInstance.md`
- `asyncAndPromise.md`
- `dataStructures.md`
- `misc.md`

如果某个文件过长，可以继续拆小。

## 单个函数记录模板

````md
## functionName

- 源码：[`functionName`](../../src/path/to/file.ts)
- 测试：[`file.test.ts`](../../src/path/to/file.test.ts)
- 形状：`Input -> Output`
- 当前状态：`已测试` / `部分测试` / `未测试` / `待确认`

### 原始行为

- 

### 参数语义

- `paramName`：

### 返回值

- 

### 边界行为

- 

### 测试覆盖

- [ ] 正常路径：
- [ ] 边界路径：
- [ ] 错误路径：
- [ ] 输出形状：
- [ ] 回归行为：

### reference 候选

```md
| [`functionName`](./src/path/to/file.ts) | `Input -> Output` | 一句用途。 | `tag` |
```

### 待确认

- 无。
````

## 记录原则

- 只记录源码和测试能确认的信息。
- 不确定内容写到“待确认”，不要写成确定结论。
- 如果发现注释和实现冲突，记录冲突，不立即改写结论。
- 如果测试暴露疑似 bug，先记录当前行为，再记录目标行为猜测。
- raw reference 可以比最终 reference 更长、更细。

## 标签候选

标签只作为后续生成 `reference.md` 的搜索候选。

常用标签类型：

- 领域词：`date`、`duration`、`numberish`、`collection`、`object`、`class`、`function`、`promise`、`event`、`tree`
- 动作意图：`format`、`parse`、`convert`、`normalize`、`validate`、`compare`、`merge`、`clone`、`pick`、`omit`、`group`、`map`、`filter`、`reduce`、`compose`、`pipe`
- 约束特征：`lazy`、`typed`、`exact`、`safe`、`async`、`sync`、`abortable`、`readonly`、`memoized`
- 输出形式：`string`、`number`、`boolean`、`array`、`object`、`map`、`set`、`iterator`、`promise`、`instance`
