# Agents 开发规范
- 代码规范在项目 [ai-rules](D://mycode/ai-rules) 项目中
- [reference.md](reference.md) 描述每个文件导出的函数功能

## 描述性文字语言规范
- 注释、JSDoc/TSDoc、测试用例描述（`describe`/`test`/`it`）、文档说明、报错说明等描述性文字，默认使用中文为主。
- 英文只用于代码标识符、参数名、变量名、类型名、API 名、库名、协议名、约定俗成的专业名词，或极短且中文表达反而更别扭的词，例如 `Map`、`Set`、`Array`、`valueMapper`、`key`、`value`、`index`、`record`、`Iterable`。
- 如果必须写较长英文描述，需要有明确原因；否则应改写成中文描述，并只保留必要的英文专业词。
- 测试名称要像业务说明一样可读，优先写中文句子，例如“toMap 可以只映射 value，同时保留 Map 原有 key”，不要写整句英文描述。
