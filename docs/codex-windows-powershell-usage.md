# Codex Windows PowerShell 操作备忘

## 文档身份

- 本文档是 Codex 在本仓库使用 Windows PowerShell 时的操作备忘。
- 本文档只记录代码查看、搜索、验证和命令 quoting 的稳定写法。
- 本文档不定义业务逻辑，不替代 [agents.md](agents.md)，也不替代具体修改计划。
- 目标是减少反复试错，避免因为 Windows shell 细节打断业务上下文。

## AI 读取回执

如果你是 AI，并且你正在读取本文档，那么读取后必须立刻在可见工作更新的第一句输出：

```text
我已查看 `codex-windows-powershell-usage.md`。
```

这条回执必须出现在执行 PowerShell 判断或命令试错之前，不能只写在最终回复里。使用者可以用这条可见回执和工具调用记录共同判断 AI 是否真的读取了本文档。

## 总原则

- 能用 `rg` 就先用 `rg`。
- 能用 PowerShell 原生 JSON 读取，就不要把复杂 JSON 检查塞进 `python -c`。
- 能用单一命令完成，就不要把多个复杂命令塞进同一个 `-Command`。
- 编辑文件使用 `apply_patch`，不要用 PowerShell 重定向写文件。
- 复杂数据抽样优先写成小而清楚的只读命令，不要追求一条命令打印全部信息。

## 可验证使用协议

- 涉及非平凡 PowerShell 操作前，先读取本文档，不能只依赖记忆。
- 涉及中文文件读取、JSON 产物抽样、Windows sandbox 初始化失败处理时，也必须先读取本文档。
- 读取动作必须能在工具调用记录中看到，例如：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "Get-Content -Path codex-windows-powershell-usage.md -Encoding UTF8 | Select-Object -First 120"
```

- 工作更新或最终汇报里应说明“已读取 `codex-windows-powershell-usage.md`”，让使用者不必猜测 agent 是否真的看过。
- 如果没有先读取本文档就开始反复试错，默认视为没有遵守本仓库 PowerShell 工作流。

## 常用读取命令

### UTF-8 读取与乱码判断

本仓库中文文档与中文注释默认按 UTF-8 读取。PowerShell 读取中文文件时必须显式写 `-Encoding UTF8`。

如果输出出现 `搴忓垪`、`璇婃柇`、`钀界洏` 这类乱码，先判断为 PowerShell 显示/读取编码问题，不要立刻推断文件内容已经损坏，也不要基于乱码内容做业务结论。

正确读取：

```powershell
Get-Content -Path 'docs\guide\CMTP训练到交易三层诊断边界.md' -Encoding UTF8
```

错误读取：

```powershell
Get-Content -Path 'docs\guide\CMTP训练到交易三层诊断边界.md'
```

在 `powershell.exe -Command "..."` 包装命令里同样必须带 `-Encoding UTF8`：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "Get-Content -Path 'docs\guide\CMTP训练到交易三层诊断边界.md' -Encoding UTF8 -TotalCount 80"
```

`Select-String` 查中文或读取中文上下文时也要尽量显式指定 UTF-8 读取对象；如果直接查文件导致显示乱码，先用 `Get-Content -Encoding UTF8` 缩小范围，再继续判断。

读取文件前 N 行：

```powershell
Get-Content -Path 'src\machineLearning\cmtp_predict.py' -Encoding UTF8 | Select-Object -First 220
```

读取文件后 N 行：

```powershell
Get-Content -Path 'docs\experiments\CMTP market_factor工程闭环实验记录.md' -Encoding UTF8 | Select-Object -Last 120
```

按关键字查上下文：

```powershell
Select-String -Path 'src\machineLearning\cmtp_predict.py' -Pattern 'position_composer_output' -Context 2,4
```

跨目录搜索优先使用 `rg`：

```powershell
rg "position_composer_output|cmtp_position_composer" src\machineLearning docs tests
```

## 通过批准的 PowerShell 包装命令

当普通 sandbox 初始化失败，需要走已批准的 PowerShell 路径时，使用完整路径：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "Get-Content -Path 'src\machineLearning\cmtp_predict.py' -Encoding UTF8 | Select-Object -First 120"
```

在这个形态里，命令字符串内部的 PowerShell 变量必须写成反引号转义：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "`$env:PYTHONPATH='src'; python -m pytest tests\test_cmtp_position_composer_test.py"
```

不要写成：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "$env:PYTHONPATH='src'; python -m pytest tests\test_cmtp_position_composer_test.py"
```

原因：外层命令解析会先吃掉 `$env`，最终变成错误的 `=src`。

## JSON 产物读取

读取 JSON 摘要优先用 PowerShell 原生能力：

```powershell
`$path = (Get-ChildItem -Path 'logs\train86\cmtp_position_composer_report_rolling0_*.json' | Select-Object -First 1).FullName
`$report = Get-Content -Raw -Encoding UTF8 -Path `$path | ConvertFrom-Json
Write-Host sampleCount `$report.sampleCount
Write-Host mean `$report.idealPositionMean min `$report.idealPositionMin max `$report.idealPositionMax
```

在 Codex tool 调用里，如果外层已经是 `powershell.exe -Command "..."`，变量全部保留反引号：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "`$path=(Get-ChildItem -Path 'logs\train86\cmtp_position_composer_report_rolling0_*.json' | Select-Object -First 1).FullName; `$report=Get-Content -Raw -Encoding UTF8 -Path `$path | ConvertFrom-Json; Write-Host sampleCount `$report.sampleCount"
```

读取多个 JSON 并做一致性检查时，仍然使用 PowerShell 原生对象，但不要在外层双引号中使用 `$()` 字符串插值。`$()` 会被当成子表达式或命令边界，容易被提前解释坏。

推荐写成字符串拼接，并把每个变量前的 `$` 都转义：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "`$summary=Get-Content -Path 'logs\train86\cmtp_position_trade_summary.json' -Encoding UTF8 | ConvertFrom-Json; `$slices=Get-Content -Path 'logs\train86\cmtp_position_trade_state_slices.json' -Encoding UTF8 | ConvertFrom-Json; `$ledger=Get-Content -Path 'logs\train86\cmtp_position_trade_ledger.json' -Encoding UTF8 | ConvertFrom-Json; Write-Output ('sampleCount=' + `$summary.sampleCount + ' stateSlices=' + `$slices.Count + ' filledTrades=' + `$summary.filledTrades + ' ledger=' + `$ledger.Count + ' start=' + `$summary.startTimestamp + '/' + `$slices[0].timestamp + ' end=' + `$summary.endTimestamp + '/' + `$slices[`$slices.Count - 1].timestamp)"
```

不要写成：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "$summary=...; Write-Output "sampleCount=$($summary.sampleCount)""
```

这类写法有两个问题：

- `$summary` 会先被外层命令解析吃掉，进入内部 PowerShell 时只剩 `.sampleCount`。
- `$()` 在外层双引号里会引发额外解释，错误表现通常是 `Unexpected token ':'`、`Missing argument in parameter list` 或把字段名当作命令。

## Python 测试命令

编译检查：

```powershell
python -m py_compile src\machineLearning\cmtp_position_composer.py src\machineLearning\cmtp_predict.py
```

跑单测时显式设置 `PYTHONPATH`：

```powershell
`$env:PYTHONPATH='src'
python -m pytest tests\test_cmtp_position_composer_test.py
```

在批准的包装命令里写成：

```powershell
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command "`$env:PYTHONPATH='src'; python -m pytest tests\test_cmtp_position_composer_test.py"
```

## 避免复杂 `python -c`

不要在 PowerShell 包装命令里写复杂的 `python -c`，尤其是包含下面元素时：

- 逗号参数，例如 `open(path, encoding='utf-8')`。
- 多层单双引号。
- 字典索引，例如 `row['field']`。
- glob 路径。
- pickle 抽样。

这些命令很容易被 PowerShell 或外层命令解析提前拆坏。

优先替代方式：

- JSON 用 `Get-Content -Raw | ConvertFrom-Json`。
- 普通文本用 `Select-String`。
- pickle 如果必须抽样，先判断是否真的需要；能从同步 JSON 报告验证的，不读 pickle。
- 如果必须读 pickle，优先写一个临时明确的只读验证脚本或仓库内测试，而不是把复杂 Python 压成一行。

## 不要用的写法

不要在 `powershell.exe -Command "..."` 里直接使用未转义变量：

```powershell
$env:PYTHONPATH='src'
$path = ...
```

应写成：

```powershell
`$env:PYTHONPATH='src'
`$path = ...
```

不要把复杂 JSON / pickle 读取写成超长 `python -c`。

不要用 `echo ... > file`、`Set-Content`、重定向或脚本拼接来修改仓库文件；文件修改统一用 `apply_patch`。

不要为了绕过 quoting 问题改变业务落点、删减验证或跳过本该做的检查。

## 推荐工作流

- 先用 `rg` 定位文件和符号。
- 用 `Get-Content` 读取目标文件的局部上下文。
- 用 `apply_patch` 做修改。
- 用 `python -m py_compile` 或 `bun run type-check` 做结构验证。
- 用项目已有测试或新增聚焦测试验证行为。
- 对 JSON 产物用 PowerShell 原生方式抽样，不用复杂 `python -c`。
- 最终用 `git status --short` 和 `git diff --stat` 汇总改动范围。

## 常用验证命令

查看工作区：

```powershell
git status --short
```

查看差异摘要：

```powershell
git diff --stat
```

TypeScript 检查：

```powershell
bun run type-check
```

Python 单文件测试：

```powershell
`$env:PYTHONPATH='src'
python -m pytest tests\test_cmtp_position_composer_test.py
```

## 处理失败

如果命令失败，先判断失败类型：

- `windows sandbox: setup refresh failed`：不是业务错误，改用已批准的完整 PowerShell 路径重跑同样的只读或验证命令。
- `ModuleNotFoundError: No module named 'machineLearning'`：测试命令缺少 `PYTHONPATH=src`。
- `=src : The term '=src' is not recognized`：`$env` 被外层解析吃掉了，应该写成 `` `$env ``。
- `Missing argument in parameter list` 或 `The string is missing the terminator`：多半是复杂 `python -c` 引号被 PowerShell 拆坏，改用 PowerShell 原生 JSON 读取或小测试。

遇到 shell 问题时，不要改变业务结论；先把命令写法收敛，再继续业务任务。
