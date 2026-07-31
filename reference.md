# 函数能力索引

这里提供 fnkit 对外工具函数的扁平索引，用于快速判断“当前场景应该看哪个函数”。

目录结构只作为源码链接路径存在，不表示函数的语义归属。具体函数契约、参数语义、边界条件和示例，以对应源码文件中的函数签名与 JSDoc/TSDoc 注释为准。

## 字段约定

- 函数：函数名，使用 Markdown 链接指向源码文件。
- 处理对象：函数主要处理的数据或概念。
- 用途：一句短语说明函数做什么。
- 标签：补充横切特征，不重复处理对象和用途。

## 标签列表

- `lazy`：可能延迟计算。
- `typed`：主要价值包含类型推导或类型约束。
- `format`：输出格式化字符串。
- `parse`：把文本或外部表示解析成结构化值。
- `exact`：强调数值精度或避免普通 number 精度问题。
- `factory`：用于创建、构造或装配对象。
- `pipeline`：用于函数管线或函数组合。
- `alias`：别名或命名友好包装。

## 索引

| 函数 | 处理对象 | 用途 | 标签 |
| --- | --- | --- | --- |
| [`mixClasses`](./src/classTools/mix.ts) | 多个 class | 合并方法和静态成员。 | `typed` |
| [`create`](./src/FPTools/instanceUtils.ts) | class | 声明式实例化对象。 | `factory` `typed` |
| [`to`](./src/FPTools/instanceUtils.ts) | 带 `from` 静态方法的 class | 调用 `Class.from()` 转换成实例。 | `factory` |
| [`make`](./src/FPTools/instanceUtils.ts) | 带 `of` 静态方法的 class | 调用 `Class.of()` 组合成实例。 | `factory` |
| [`build`](./src/FPTools/instanceUtils.ts) | 带 `build` 静态方法的 class | 调用 `Class.build()` 按配置装配实例。 | `factory` |
| [`map`](./src/collectionMethods/map.ts) | Array / Set / Map / Object / Iterable | 统一映射元素值。 | `lazy` |
| [`filter`](./src/collectionMethods/filter.ts) | Array / Set / Map / Object / Iterable | 统一过滤集合内容。 | `lazy` |
| [`pipe`](./src/pipe.ts) | 值和函数列表 | 按顺序把值传入多个函数。 | `pipeline` `typed` |
| [`compose`](./src/compose.ts) | 函数列表 | 把多个函数组合成一个新函数。 | `pipeline` `typed` |
| [`runTask`](./src/runTasks.ts) | 单个 task | 执行单个同步或异步任务，并统一返回 Promise。 | `pipeline` `typed` |
| [`runTasks`](./src/runTasks.ts) | task 数组 | 按串行或并行模式执行一组任务，默认串行。 | `pipeline` `typed` |
| [`hasProperty`](./src/compare.ts) | 未知值与 PropertyKey | 判断值是否持有一个或多个属性并收窄类型。 | `typed` |
| [`toObjectProxy`](./src/object-proxy.ts) | Promise 中的对象 | 转成可递归读取、调用和等待的 ObjectProxy。 | `factory` `typed` |
| [`isObjectProxy`](./src/object-proxy.ts) | 未知值 | 判断值是否实现 ObjectProxy 的 symbol 身份协议。 | `typed` |
| [`toPromiseFromObjectProxy`](./src/object-proxy.ts) | ObjectProxy | 取得解析当前真实值的原生 Promise。 | `typed` |
| [`Neuron.source`](./src/customizedClasses/Neuron/Neuron.ts) | 根数据流节点 | 创建输入输出同型、持有独立 context 的根 Neuron。 | `factory` `pipeline` `typed` |
| [`Neuron.deriveFrom`](./src/customizedClasses/Neuron/Neuron.ts) | 已有 Neuron 与 mapper | 创建保存转换规则的下游 Neuron，并通过订阅接收上游信号。 | `factory` `pipeline` `typed` |
| [`Neuron.subscribe`](./src/customizedClasses/Neuron/Neuron.ts) | subscriber FN | 订阅 output，并取得当前 Neuron 一直持有的 context。 | `pipeline` `typed` |
| [`Neuron.tick`](./src/customizedClasses/Neuron/Neuron.ts) | 一次 input | 让数据流经过当前 Neuron，并在传播结束前推进 context.prev。 | `pipeline` `typed` |
| [`Neuron.loadPlugin`](./src/customizedClasses/Neuron/Neuron.ts) | Neuron 与插件列表 | 装载可包装公开能力或增强 context 的能力模块。 | `typed` |
| [`NeuronContext`](./src/customizedClasses/Neuron/Neuron.ts) | 节点上下文 | 跟随 Neuron 一直存在；Neuron 自动更新 prev，插件可以扩展或调整字段。 | `typed` |
| [`new Subscription`](./src/customizedClasses/Subscription.ts) | 可取消资源 | 创建只执行一次取消动作的生命周期句柄。 | `factory` |
| [`isNeuron`](./src/customizedClasses/Neuron/utils/isNeuron.ts) | 未知值 | 判断值是否为当前 Neuron 类的实例。 | `typed` |
| [`formatDate`](./src/timeTools/stringifyDate.ts) | 日期值 | 按格式字符串输出日期文本。 | `format` |
| [`toDateString`](./src/timeTools/stringifyDate.ts) | 时间戳 | 快速转成日期时间字符串。 | `format` `alias` |
| [`parseDuration`](./src/timeTools/parseDuration.ts) | 秒数 duration | 拆成天、时、分、秒、毫秒结构。 | `parse` |
| [`parseTimeLabel`](./src/timeTools/parseDuration.ts) | 时间标签 | 把 `5m`、`2 hours` 等时间标签转成秒。 | `parse` |
| [`toMilliseconds`](./src/timeTools/parseDuration.ts) | 时间标签 | 把时间标签转成毫秒。 | `alias` |
| [`formatDuration`](./src/timeTools/stringifyDuration.ts) | 时间标签 | 按格式字符串输出 duration 文本。 | `format` |
| [`toFormattedNumber`](./src/numberish/toFormattedNumber.ts) | Numberish | 输出带分组、精度或短单位的数字字符串。 | `format` |
| [`trimTailingZero`](./src/numberish/toFormattedNumber.ts) | 数字字符串 | 移除小数末尾多余的 0。 | `format` |
| [`enpureNumberish`](./src/numberish/parseNumberish.ts) | Numberish | 递归展开 `toNumberish()` 得到基础数值表示。 | `parse` |
| [`add`](./src/numberish/operations.ts) | Numberish | 精度友好地执行加法。 | `exact` |
| [`multiply`](./src/numberish/operations.ts) | Numberish | 精度友好地执行乘法。 | `exact` |
| [`divide`](./src/numberish/operations.ts) | Numberish | 精度友好地执行除法。 | `exact` |
| [`abs`](./src/numberish/operations.ts) | Numberish | 取绝对值。 | `exact` |
