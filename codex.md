# Codex 项目运行备忘

## 编码安全与乱码禁区

本仓库大量代码注释、文档、prompt、demo 任务文本使用中文。修改这些文件时，必须把“不要产生乱码”当成和类型检查同级的重要约束。

关键词：乱码、编码安全、UTF-8、中文注释、中文文档、PowerShell、Get-Content、Set-Content、批量替换、apply_patch。

处理规则：

- 禁止使用 PowerShell 的 `Get-Content` / `Set-Content` 对包含中文的文件做批量读取、替换、写回。这个组合可能按本地代码页读取 UTF-8，再写回成损坏文本。
- 修改中文代码注释、中文文档、中文 prompt 时，优先使用 `apply_patch`，只改目标片段，不做无关全文件重写。
- 如果 `apply_patch` 暂时不可用，允许使用 `.NET` 文件 API 明确指定 UTF-8，例如 `[System.IO.File]::ReadAllText(path, [System.Text.Encoding]::UTF8)` 和 `[System.IO.File]::WriteAllText(path, content, [System.Text.UTF8Encoding]::new($false))`。
- 禁止用 shell 脚本、Python 脚本、Node 脚本对中文文件做未验证编码的全文件重写。除非用户明确要求，并且先说明编码方案和回滚方式。
- 如果必须做批量替换，先在小文件或临时副本验证 UTF-8 往返，再执行；执行后必须搜索 `銆`、`鏂`、`鍗`、`娴`、`�` 等乱码特征。
- 一旦发现乱码，必须立刻停止普通功能修改，先恢复可读中文。乱码过一段时间后会丢失上下文，维护成本极高。
- 不能因为 `bun run type-check` 通过就认为修改安全。乱码通常不影响类型检查，但会破坏注释、文档、prompt 和未来维护。

## 本仓库注意事项

- `bun run type-check` 通常可以在当前仓库里直接运行。
- 新增或修改对外导出的工具函数时，同步检查 `src/index.ts` 和 `reference.md`。
- 测试描述、注释、JSDoc/TSDoc、报错说明等描述性文字默认使用中文。
