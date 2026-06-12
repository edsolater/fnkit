# JSDoc 说明清单

## 用途

本文档只做人工统计：哪些源码文件或函数的 JSDoc/TSDoc 已经足够，哪些需要后续补充。

这里不写函数详细说明，不替代源码 JSDoc/TSDoc，也不替代根目录 `reference.md`。函数的准确描述应尽量写在实现旁边的 JSDoc/TSDoc 中。

## 记录规则

- 只记录“是否需要补说明”和简短原因。
- 不展开参数、返回值、边界行为的详细解释。
- 不为每个源码文件创建单独说明文档。
- 执行模型补测试时，除非用户明确要求，否则只更新测试；发现说明缺口时可在这里登记。

## 清单

| 源码文件 | 导出项 | JSDoc 状态 | 备注 |
| --- | --- | --- | --- |
| `src/bindThisIfFunction.ts` | `bindThisIfFunction` | 待补 | 当前已有基础测试；源码说明可以更简洁地说明“函数绑定 this，非函数原样返回”。 |
| `src/bindParams.ts` | `bindParams` | 待补 | 当前已有基础测试；源码说明仍偏英文旧风格，需要改成清楚的中文 JSDoc。 |
| `src/pipe.ts` | `pipe` | 待补 | 当前已有基础测试；源码缺少说明，后续可补一句“按顺序执行函数链”。 |
| `src/compose.ts` | `compose` | 待确认 | 当前已有基础测试；实现顺序等价于延迟执行 `pipe`，命名是否需要额外说明待判断。 |
| `src/mergeObject.ts` | `shallowMergeObjectWithConfig`、`getValues`、`getKeys`、`getKeySet` | 待补 | 当前已有基础测试；源码说明有乱码/旧注释痕迹，后续应整理成清楚中文。 |
| `src/FPTools/instanceUtils.ts` | `create`、`to`、`make`、`build` | 待确认 | 当前已有基础测试；`create` 的 `Target.length === 0` 构造器判定边界需要人工判断后再决定如何写。 |
