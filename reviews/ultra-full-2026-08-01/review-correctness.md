# yuleASR-Configurator Correctness 代码审查报告

**审查日期:** 2026-08-01 **审查范围:**
`reviews/ultra-full-2026-08-01/files.txt`（402 文件 / 约 11.3 万行）

## 审查范围与覆盖说明

**精读区域（本报告依据）：**

- `packages/@yuletech/core`：conditions（evaluator/parser/propagator/depends）、validators（pipeline/yuleasr/cross-module/choice-container/ConfigValidator）、generator（ecuc/os/rte/swc/autosar-format）、plugins（manager/registry/builtins）、schema/load-generated、adapters（arxml/yuleasr）
- `apps/yuleasr-web`：stores（configStore/authStore）、services（api/codegen/arxml-exporter/compareEngine/yuleoshPipeline）、core（DependencyValidator/ParameterValidator）、Editor.tsx、ParameterEditor、ContainerParameterList、ConfigTree 关键段、PipelineStatusPanel、Layout、types/config
- `packages/@yuletech/api-server`：index、auth、license、configs、db schema 引用
- `packages/yuleasr-editor-core`：engine/index、services/index、services/gitService
- `apps/yuleasr-vscode`：commands/index、panels/ConfigEditorPanel

**按任务要求跳过（纯数据/内容文件快速扫）：**
`all-modules.ts`、`modules.ts`、`mcal-config.ts`、`ecual-config.ts`、`os-config.ts`、`blog/articles.ts`、autosar-spec/headers、communityData 等。

**未覆盖（明确声明，未发现≠无问题）：**
`apps/yuleasr-desktop/electron/*`、`@yuletech/api-client`、`@yuletech/ui`
组件库、`@yuletech/utils`、`@yuletech/core/src/swc/*`、`schema-extractor`、`apps/yuleasr-web`
中其余组件（ModuleConfigWizard/OSEditor/ConfigCompareDialog/ShareDialog/MigrationTool/ModuleGraph 等）、`apps/yulecommunity`
社区端全部展示型组件（仅抽查了 BSWConfigurator/DependencyGraph/PinConfigurator 的结构）、`yuleasr-editor-core/src/sync`
与 `rte-external`。

---

# 一、Critical 问题（会导致数据丢失/功能整体失效）

## [C1] 参数编辑静默失败：updateParameter 永远匹配不到参数 ID

**File:** apps/yuleasr-web/src/stores/configStore.ts:318-375 **Severity:**
critical **What is wrong:** `updateParameter(path, value)` 解析路径后取
`pathParts[pathParts.length - 1]`
作为参数 id 去匹配：`module.parameters.map(p => p.id === pathParts[pathParts.length - 1])`。但实际传入的路径形态是
`layer:MCAL/module:adc/container:adcconfigset` 或
`.../instance:AdcHwUnit_0`，最后一段是 `container:xxx` 或
`instance:xxx`；而参数 id 来自 all-modules.ts（如
`adcdozemode`）。**任何路径下均不匹配**，map 后无任何参数被更新，且无报错。另外
`let targetParam: any;` 声明后从未赋值，`targetParam?.name` 恒为 undefined。
**Why it matters:**
用户在编辑器里修改任何参数，改动只停留在 ParameterEditor 的局部 state（`setValue`），store 的
`currentConfig`
从未更新 → 保存配置/导出/生成代码时用的是旧值，用户以为改了的参数全部丢失且无任何提示。这是整个编辑器最核心的数据通路。
**What needs to change:** 修改参数定位逻辑：先用 `module:` 段定位模块，再用参数
`name`（而非 id）或引入 `param:` 路径段；建议统一为
`layer:/module:/container:/instance:/param:` 规范路径，`updateParameter`
按 param 段定位，并补单元测试覆盖「静态容器参数」「实例参数」两条路径。

## [C2] 动态容器实例的参数值不进入 ConfigFile，保存即丢失

**File:** apps/yuleasr-web/src/components/ConfigTree.tsx:145-227, 453-487
**Severity:** critical **What is wrong:**
动态实例（multiple 容器）的数据存于 ConfigTree 组件本地 `dynamicInstances`
state（路径 → {name,
paramValues}[]），增/删/改/复制实例（addInstance/copyInstance/removeInstance/renameInstance）只操作该 state，从不回写到
`currentConfig`。Editor 中编辑器显示的 `instanceContainer` 由
`selectedContainer.subContainers[0]`
虚构造，编辑结果经 C1 的失效链路最终也不落库。 **Why it matters:**
用户为 CanController 等 multiple 容器添加的实例及其参数，保存/导出后全部消失；配置树与保存数据是两个世界。
**What needs to change:**
将动态实例数据提升（或同步）到 configStore/currentConfig（如
`ConfigContainer.instances`），所有实例操作走 store 并标记 dirty；保存时随 ConfigFile 序列化。

## [C3] Web↔Server API 全链路断裂：认证/云同步在任何部署下都不可用

**File:** apps/yuleasr-web/vite.config.ts:22-32;
packages/@yuletech/api-server/src/index.ts:60-76;
apps/yuleasr-web/src/services/api.ts:5-95 **Severity:** critical **What is
wrong:** 三处叠加：(1) dev proxy 对 `/api` 前缀做
`rewrite: path => path.replace(/^\/api/, '')`，而 server 路由全部挂在
`/v1/*`（`/v1/auth`、`/v1/api/license` 等），web 的 `api.ts` 调
`/api/auth/login`、`/api/configs/...` 经 rewrite 变成
`/auth`、`/configs`，server 无这些路由 → 404；(2) `index.ts` 中 **`configs.ts`
的路由从未被 import/register**（`/api/configs`
服务端根本不存在）；(3) 即便注册，web 使用字符串 id（`config-${Date.now()}`），server
`configs.ts` 用 `parseInt(id)` 转 int 且从 `request.user` 读 `userId` 而 JWT
payload 只有 `id`（auth.ts:31），id 格式与字段名双重错配。 **Why it matters:**
登录/注册/云同步/配置锁全部静默失败：configStore 的 catch 回退 localStorage，用户无感知地以为已云端同步（`isCloudSynced`
甚至可能为 true），实际数据只在本机。 **What needs to change:**
统一 API 前缀（建议 server 全部路由改 `v1/`
且 proxy 仅转发不 rewrite，或 api.ts 使用 `/v1/...`
并在生产配置 VITE_API_URL）；在 index.ts 注册 configsRoutes 并携带 prefix；服务端改用字符串 uuid 或让 web 接受 server 返回的数字 id。

## [C4] isCloudSynced 语义错误：保存失败仍标记已同步

**File:** apps/yuleasr-web/src/stores/configStore.ts:519-526 **Severity:**
warning（与 C3 叠加后为 critical 的用户可见后果） **What is wrong:**
`saveConfig` 中 `await get().syncToCloud()` 的 catch 只 `console.warn`，随后
`set({ isCloudSynced: true })` 在成功路径才执行——但 404 分支（598-601）在
`err?.status === 404`
时发起 post 后若无异常也置 true。由于 C3 使所有请求 404 且 post 也 404，`isCloudSynced`
会被错误置位。 **Why it matters:**
UI 显示「已云同步」，用户以为配置在云端，换设备后丢失。 **What needs to
change:** 只有确实收到 2xx 才置
`isCloudSynced`；任何分支失败保持 false 并给出可见提示。

---

# 二、packages/@yuletech/core 问题

## [K1] schema-validator-plugin 永远空转（死代码）

**File:**
packages/@yuletech/core/src/plugins/builtins/schema-validator-plugin.ts:31,48
**Severity:** warning **What is wrong:** 插件从 `schemaCache.get(moduleName)`
取 schema，但全仓库没有任何地方调用
`schemaCache.set(...)`（仅此插件调用 get）。cache 恒为空 → 对每个模块返回 info「No
schema
found」后 continue，**required/enum/range 校验从未执行**。同一问题：cross-module-validator-plugin.ts:49-55 从 schemaCache 取也为空，靠 fallback
`loadModuleSchemas()` 才偶然工作。 **Why it matters:** 声称的「AUTOSAR Schema
Validator」功能形同虚设；文档承诺的必填/范围校验不生效。 **What needs to
change:** 在 `registerBuiltinPlugins` 或插件 activate 时用 `loadModuleSchemas()`
结果填充 schemaCache；或两个插件直接改用 `loadModuleSchemas()`。

## [K2] ConditionEvaluator 对 config.parameters 缺失的假设

**File:** packages/@yuletech/core/src/conditions/evaluator.ts:71,84,94
**Severity:** warning **What is wrong:** `if (paramName in config.parameters)`
直接在 `config.parameters` 上做 `in`。`ModuleConfig.parameters`
若为 undefined（外部通过 `as`
构造的 config 未带该字段，例如 plugin 场景、测试、手写 JSON）会抛 TypeError，而不是按文档「fails
closed → false」。 **Why it matters:**
条件求值应在任何畸形输入下返回 false 而不是崩溃；ValidationPipeline 中该异常未被捕获（只在 conditions 循环里 catch，evaluateCondition 内部 throw 会被捕获为 CONDITION_ERROR，但内部 'path' 求值在 validators 路径外可能直接冒泡）。
**What needs to change:** 所有访问点改为 `config.parameters?.[paramName]` +
`paramName in (config.parameters ?? {})`，并加单测覆盖 parameters 缺失。

## [K3] YuleasrValidator：range 规则是空壳，Mcu custom 规则消息错位

**File:** packages/@yuletech/core/src/validators/yuleasr-validator.ts:82-92,
308-315 **Severity:** warning **What is wrong:** (1) `rule.type === 'range'`
分支只做 `isNaN(numValue)` 检查，从不校验 `min/max/正数`，规则参数 `params`
全被忽略——「Clock frequency must be positive」永远不会触发；(2) Mcu custom rule
`condition: config => config.parameters.clock_frequency !== undefined`
配消息「Mcu must be enabled for all
configurations」，当 Mcu 存在但未填 clock_frequency 时错误地报「必须启用」而非「缺少时钟频率」，而 Mcu 完全缺失时此规则又根本不执行（validateModule 只对存在的 config 调用）。
**Why it matters:**
验证器给出错误/误导的诊断，用户会被「Mcu 未启用」误导去启用模块而非补充参数。
**What needs to change:**
range 规则实现 min/max 校验；拆成两条规则（模块存在性检查 + 参数必填检查）并修正消息；补充测试。

## [K4] 条件表达式 lexer 允许畸形数字 `1.2.3`

**File:** packages/@yuletech/core/src/conditions/parser.ts:125-128 **Severity:**
warning **What is wrong:** 数字 token 用 `/[0-9.]/` 循环吞字符，`1.2.3`
整体成为一个 token，parsePrimary 用 `parseFloat` → 1.0，静默丢掉
`.2.3`。`Can.baudrate == 1.2.3` 会被解析为 `== 1`。 **Why it matters:**
表达式书写错误时不报语法错误而以错误值参与求值，条件静默错误。 **What needs to
change:** 数字 lexer 限定最多一个小数点（否则抛 SyntaxError），并加测试。

## [K5] ConstraintPropagator fallback 使用 `new Function` 动态执行

**File:** packages/@yuletech/core/src/conditions/propagator.ts:316-333
**Severity:** warning **What is wrong:**
表达式解析失败后，fallback 把 sanitized 字符串（仅保留 `[0-9+\-*/.()?:<>!= ]`
字符集）交给 `new Function('"use strict"; return (...)')()` 执行。字符集内
`!`、`<`、`>` 可组合出 `!0`、`1<2`
等合法 JS；虽难注入任意代码，但属于不可控的动态执行，且 sanitize 失败时返回原始
`input` 字符串作为「结果」。 **Why it matters:**
若表达式来自 Schema 上游数据（可能被用户/第三方模板注入），存在不可预期行为/潜在执行面；且失败路径返回字符串而非报错，静默产生错误结果。
**What needs to change:** 移除 `new Function`
fallback；解析失败直接抛错并让调用方记录 PropagationResult 失败。

## [K6] OS 生成器：引用不存在的 Task/Counter 时输出未定义宏

**File:** packages/@yuletech/core/src/generator/os-generator.ts:852, 893, 1166,
1168, 1269 **Severity:** warning **What is wrong:** Alarm 的
`OsAlarmCounterRef`、Event 的 `OsEventTaskRef`、Alarm 的 `OsAlarmActionTaskRef`
直接用模板拼出 `OS_COUNTER_ID_${name.toUpperCase()}` /
`OS_TASK_ID_${name.toUpperCase()}`，无任何引用完整性校验。若引用名不存在或含小写/特殊字符，生成
`OS_TASK_ID_MYTASK` 这类未定义宏 →
C 编译失败；若名称含非法字符（`-`、空格、数字开头）则宏名非法。 **Why it
matters:**
用户配置了指向不存在 Task 的 Event，生成的代码编译期才爆炸，且错误信息离源头很远。
**What needs to change:**
生成前校验所有引用（taskRef/counterRef/taskRefList/counterRef 等都必须在已收集集合中），缺失时返回生成错误或跳过并追加 warning。

## [K7] RTE 生成器：接口/任务名称未做 C 标识符合法性校验

**File:** packages/@yuletech/core/src/generator/rte-generator.ts:741-743,
753-757, 771 **Severity:** warning **What is wrong:**
`RTE_TASK_${task.name.toUpperCase()}_ID`、`RTE_INTERFACE_${iface.name.toUpperCase()}_TYPE`
直接拼宏名，task/interface/port 名称来自用户配置，可含连字符、点、空格 → 生成非法 C 标识符。
**Why it matters:** 与 K6 同类，生成物不可编译。 **What needs to change:**
对名称做 `[A-Za-z_][A-Za-z0-9_]*` 校验，非法即报错。

## [K8] ChoiceContainerValidator 对 instance.parameters 缺失无防御

**File:**
packages/@yuletech/core/src/validators/choice-container-validator.ts:71-81
**Severity:** warning **What is wrong:** `instance.parameters[paramName]`
直接访问，若 config 中的容器实例缺少 `parameters`
字段（手写/外部导入），抛 TypeError 中断整个验证。 **Why it matters:**
验证器应容错降级而不是让整个 pipeline 崩溃。 **What needs to change:**
`(instance.parameters ?? {})[paramName]`。

## [K9] CrossModuleValidator 容器引用只检查第一个实例

**File:**
packages/@yuletech/core/src/validators/cross-module-validator.ts:132-136
**Severity:** warning **What is wrong:** `ref.container` 存在时
`targetValue = instances[0].parameters[ref.param]`，多实例容器只查 index 0。
**Why it matters:** 第 2+ 个实例违反约束时漏报。 **What needs to change:**
对每个实例求值，任一违反即报错。

## [K10] validateAffectedBy 对容器内参数永远跳过

**File:**
packages/@yuletech/core/src/validators/cross-module-validator.ts:249-250
**Severity:** warning **What is wrong:** 增量验证只查
`changedConfig.parameters[changedParam]`。容器内参数经 load-generated 平铺在 schema.parameters 中，但实际值在
`config.containers[*].parameters`，顶层 `parameters` 取到 undefined →
continue。用户在 UI 中修改容器参数触发的增量 cross-module 验证全部空转。 **Why
it matters:**
UI 的「增量验证」对最常见的容器参数编辑完全无效（静默），validationIssues 缺失本应出现的跨模块错误。
**What needs to change:** 增量验证需同时在 `parameters` 与 `containers`
中定位值。

## [K11] ecuc-generator：负整数参数生成非法 C

**File:** packages/@yuletech/core/src/generator/autosar-format.ts:29-35
**Severity:** warning **What is wrong:** `formatCValue(value,'integer')`
对负数输出 `((uint32)-5U)`——C 语言非法（`-5U` 无符号后取负仍合法？实际
`((uint32)-5U)` 中 `-5U` 是 unsigned negation，编译通过但值 =
2^32-5，语义错误；而 `((uint16)-5U)`
同理截断）。生成者本意是包装为 uint 但未处理负数。 **Why it matters:**
配置中合法存在的负数（如某些 offset/延迟）生成后值错误或告警，不报错则更危险。
**What needs to change:** 负数输出 `((sint32)-5)`
或保持裸数字，按 AUTOSAR 类型表区分有符号。

## [K12] 插件 enable 后已注册的 generator/validator 不会恢复

**File:** packages/@yuletech/core/src/plugins/plugin-manager.ts:163-169, 176-204
**Severity:** warning **What is wrong:** `disable()`
会把该插件注册的 codeGenerators/validators/dataExporters 从 registry 移除；`enable()`
只把
`meta.enabled=true`，从不重新注册这些能力。disable→enable 循环后插件声称 enabled 但功能消失。
**Why it matters:** 插件管理 UI 上「重新启用」无效，用户困惑。 **What needs to
change:**
enable 时根据插件实例重新构建 context 并重注册能力（或 disable 时不移除注册、只在 find 时按 enabled 过滤）。

---

# 三、apps/yuleasr-web 问题

## [W1] Editor.selectedModule 用 substring 匹配模块 id

**File:** apps/yuleasr-web/src/pages/Editor.tsx:321-323 **Severity:** warning
**What is wrong:**
`currentConfig?.modules.find(m => selectedPath.includes(m.id))`。模块 id 是简短小写（`can`、`cantrcv`、`cannm`…），路径
`module:cantp` 会 `includes('can')` 为 true → 命中最先出现的 `can`（或
`cantrcv`）。选中 CanTp 时右侧参数面板会错误地显示另一个模块的容器（findContainer 在错模块里找不到目标容器 id
→ 面板空白）。 **Why it matters:** 多模块选择错乱，无法编辑到目标模块容器。
**What needs to change:** 用正则精确匹配 `module:([^/]+)` 段。

## [W2] ParameterEditor：非法输入时 UI 与 store 值分叉

**File:** apps/yuleasr-web/src/components/ParameterEditor.tsx:142-159
**Severity:** warning **What is wrong:** `handleChange` 先
`setValue(newValue)`，校验失败时 `onChange` 不被调用 →
store 保留旧值、UI 显示新值（如超范围的 9999）。用户继续编辑其他参数后保存，此参数被悄悄还原为旧值。
**Why it matters:**
与 C1 叠加后「改了什么都不生效」的体验更隐蔽：一部分因 C1 失效，一部分被 UI 掩盖。
**What needs to change:**
校验失败时 UI 回显旧值或明确标红并禁用保存；成功时才 setValue。

## [W3] api.ts 401 强制跳转 `/login`

**File:** apps/yuleasr-web/src/services/api.ts:46-51 **Severity:** warning
**What is wrong:** 应用部署 base 是
`/configurator/`（vite.config.ts:8），`window.location.href = '/login'`
在 GitHub
Pages 下跳到站点根而非应用内；同时 401 属于可恢复场景（如 token 过期），直接整页跳转会丢失当前未保存编辑。
**Why it matters:** 生产部署下跳转到不存在的路由，且破坏编辑器状态。 **What
needs to change:** 用路由级跳转（navigate）并保留 returnUrl；跳转前显式提示。

## [W4] compareEngine：子容器参数 diffs 在树视图丢失

**File:** apps/yuleasr-web/src/services/compareEngine.ts:471-493 **Severity:**
warning **What is wrong:** `buildDiffTree` 中容器节点的 `containerPath` 为
`${module}.${容器名}`，而子容器参数的 `containerPath` 是
`模块.父容器.子容器`（buildContainerPath 拼接），filter 永不相等 → 子容器参数级 diff 不显示（只显示容器 only_a/only_b 级）。
**Why it matters:** 比较视图漏报参数差异，用户以为两个配置相同。 **What needs to
change:** 用 container id（而非名称拼接）建立树节点与参数 diff 的关联。

## [W5] codegen.ts 字符串参数生成无引号宏

**File:** apps/yuleasr-web/src/services/codegen.ts:113-114 **Severity:** warning
**What is wrong:** `formatMacroValue`
对 string 直接返回原值，`#define CAN_CHANNEL  channel0`（channel0 被当作标识符而非字符串字面量）。对非枚举自由文本值会生成不可编译/链接错误的 C。
**Why it matters:** 生成代码质量取决于参数值是否恰好是合法 C 标识符。 **What
needs to change:** 明确区分「枚举/标识符型参数」原样输出与「文本型参数」加引号。

## [W6] DependencyValidator.validateRTEConsistency 为空实现

**File:** apps/yuleasr-web/src/core/DependencyValidator.ts:345-351 **Severity:**
warning **What is wrong:** 方法体只有注释，声称验证 interface/port
connection 实际什么都做。 **Why it matters:**
功能名不副实，RTE 配置错误（引用不存在的 interface 等）无处报错。 **What needs
to change:** 实现或移除；至少在 UI 标注「未启用」。

## [W7] DependencyValidator.required 检查漏掉 null

**File:** apps/yuleasr-web/src/core/DependencyValidator.ts:197 **Severity:**
suggestion **What is wrong:** `value === undefined || value === ''` 未含
`null`；required 参数被显式置 null 时不报错。 **What needs to change:** 加入
`value === null`。

## [W8] ConfigTree 实例重命名无重名检测

**File:** apps/yuleasr-web/src/components/ConfigTree.tsx:496-511 **Severity:**
warning **What is wrong:** `confirmRename` 只检查非空，两个实例可重名 → 树中
`instance:` 路径冲突，后续 find/remove 全部匹配到第一个。 **What needs to
change:** 重命名前检查同容器下唯一性。

## [W9] Editor.handleImport 不校验 JSON 结构

**File:** apps/yuleasr-web/src/pages/Editor.tsx:254-259 **Severity:** warning
**What is wrong:** 任意 JSON `JSON.parse` 后直接 `setState(currentConfig)`，无
`module`/`modules` 校验；无 `.modules` 的 JSON 导入后 Editor 渲染
`currentConfig.modules` 抛错白屏。 **What needs to change:**
导入前校验 ConfigFile 必需字段，失败给明确报错并回退原状态。

## [W10] loadConfigList 的「Migration」分支对空列表也 seed，但 list.length===0 时只建 3 个样例且丢 user 自建

**File:** apps/yuleasr-web/src/stores/configStore.ts:695-758 **Severity:**
suggestion **What is wrong:** 首次运行空列表时覆盖式 seed
4 个样例配置并直接保存，没有「用户已有本地旧 key 但 list 键不存在」的迁移兜底（旧 key
`yuleasr_config` 只在 loadConfig 中兜底）。 **What needs to change:**
seed 前检查旧 key，存在则迁移而非覆盖。

## [W11] PipelineStatusPanel 完成回调后 Editor 延迟 10s 清 jobId

**File:** apps/yuleasr-web/src/pages/Editor.tsx:787-790 **Severity:** suggestion
**What is wrong:** `setTimeout(() => setActivePipelineJobId(null), 10000)`
未清理，组件卸载后仍触发 setState；若期间用户重新触发新 pipeline，旧 timer 会误清新 jobId。
**What needs to change:** 用 ref 记录 timer 并在卸载/新任务时清理。

---

# 四、@yuletech/api-server 问题

## [A1] configs.ts 路由未注册（与 C3 同源）

**File:** packages/@yuletech/api-server/src/index.ts:60-76 **Severity:**
critical（云同步功能整体） **What is wrong:** `configs.ts`
从未被 import/register，`/configs`、`/configs/:id`、lock/unlock 全部 404。
**What needs to change:** 注册 `configsRoutes`（prefix 与 web 端对齐）。

## [A2] configs.ts 读 `request.user.userId`，JWT payload 只有 `id`

**File:**
packages/@yuletech/api-server/src/routes/configs.ts:23,27,35 等；src/routes/auth.ts:31
**Severity:** warning **What is wrong:**
`(request.user as { userId: number }).userId` →
undefined；`eq(configs.userId, undefined)` 行为未定义，用户数据隔离失效风险。
**What needs to change:** 统一用 `id`。

## [A3] JWT_SECRET 默认值硬编码

**File:** packages/@yuletech/api-server/src/index.ts:24 **Severity:** warning
**What is wrong:** 未配置环境变量时使用
`dev-secret-change-in-production`，任何部署者都知道该密钥，可伪造任意用户 token。
**What needs to change:**
生产环境启动时强制要求有效 JWT_SECRET（无则拒绝启动）。

## [A4] license 激活没有幂等/试用期保护，且 `shareToken` 生成后不可吊销

**File:** packages/@yuletech/api-server/src/routes/license.ts:87-127
**Severity:** suggestion **What is wrong:**
激活接口可重复调用刷新绑定（同 user 再次 bind OK）；`/validate`
不校验 user 绑定关系（任何人拿 key 可验证）。分享 token 无过期/吊销机制（configs.ts
shareToken 只在创建时生成一次）。 **What needs to change:**
明确 license 绑定语义；share 提供显式 share/revoke 接口。

---

# 五、yuleasr-editor-core 问题

## [E1] setValues 对不存在的参数标记成功并写历史

**File:** packages/yuleasr-editor-core/src/engine/index.ts:296-310 **Severity:**
warning **What is wrong:** 收集阶段
`const oldParam = module.parameters.get(paramName);`
未判空，直接把 results.push(true) 并 push 历史。应用阶段 `setParameterValue`
返回 false 时跳过且不修正 results。 **Why it matters:**
调用方收到 success=true 但值没设置；undo 会尝试反解从未被应用的变更；批量历史与实际应用不匹配。
**What needs to change:** 应用成功后才 push 历史并返回 true。

## [E2] 批量 undo 就地 reverse entries，破坏 redo 顺序

**File:** packages/yuleasr-editor-core/src/engine/index.ts:406 **Severity:**
warning **What is wrong:** `batchEntry.entries.reverse()`
就地反转数组；undo 后该批次 entries 顺序被永久改变，随后 redo 遍历的是已被反转的数组，撤销/重做不对称（若 setParameterValue 有级联依赖则最终状态错误）。
**What needs to change:** 用 `[...entries].reverse()` 副本。

## [E3] redo delete 语义错误：用 set(undefined) 冒充删除

**File:** packages/yuleasr-editor-core/src/engine/index.ts:487-500 **Severity:**
warning **What is wrong:** `applyRedoEntry` 对 delete 类型调
`setParameterValue(..., undefined)`，而删除实际是
`module.parameters.delete(paramName)`（375 行）。redo 后参数仍在 Map 中（值为 undefined），与 undo 前的「不存在」状态不一致；getValue 返回 undefined 但遍历 (module.parameters) 会看到该 key。
**What needs to change:** redo
delete 也走真正的 delete；undo/redo 统一走 project API。

## [E4] ValidationService.validate(configId) 验证的配置与规则评估的配置不一致

**File:** packages/yuleasr-editor-core/src/services/index.ts:127-146
**Severity:** warning **What is wrong:** `engine.validate()`
固定验证当前配置，而 custom rules 用 `configId`
指定的配置收集 context；两者可能不是同一配置 → 规则结果张冠李戴。 **What needs
to change:** 统一为一个 config 目标。

## [E5] engine.validate() 实质是空验证

**File:** packages/yuleasr-editor-core/src/engine/index.ts:532-589 **Severity:**
warning **What is wrong:** 只把
`param.errors`（需外部手动塞入的字符串数组）转成 ValidationError，没有任何基于 schema 的类型/必填/范围校验；`ValidationService.validateModule/validatePath`
才有必填检查但范围/类型仍缺。 **Why it matters:**
声称的验证能力实际大多不工作，用户信任该结果会有错误配置出厂。 **What needs to
change:** 接入 @yuletech/core 的 validateAll/ConfigValidator 复用实现。

## [E6] engine.import 在 configId 与返回 id 不一致时设置悬空 currentConfigId

**File:** packages/yuleasr-editor-core/src/engine/index.ts:614-626 **Severity:**
suggestion **What is wrong:** `setCurrentConfig(configId)`
用调用方传的 id，而 project.getConfig(configId) 查不到（真实 id 是 import 返回的 config.id）→
currentConfigId 悬空，getCurrentConfig fallback 到 active
config，行为取决于 project 实现。 **What needs to change:**
校验传入 id 存在性，否则用返回 config.id。

## [E7] gitService 状态判定不识别 renamed

**File:** packages/yuleasr-editor-core/src/services/gitService.ts:280-296
**Severity:** suggestion **What is wrong:**
statusMatrix 三元组只处理 added/deleted/modified，renamed（head=1 且路径变化）会被标为 added/deleted，`FileStatus.status`
类型声明含 renamed 但永远不会产生。 **What needs to change:**
补充 rename 检测或用 isomorphic-git statusMatrix 的 path 对比。

---

# 六、apps/yuleasr-vscode 问题

## [V1] sync/generate 命令是假实现（纯 sleep + 成功提示）

**File:** apps/yuleasr-vscode/src/commands/index.ts:188-215, 298-314
**Severity:** warning **What is wrong:** `syncWithYuleASR` 只做 3 次
`delay(500)` 无任何文件操作；`generateCodeForConfig` 同理只 sleep
1s 便提示「Code generated」，实际不生成任何文件。 **Why it matters:**
对用户谎报成功；「同步完成」「生成成功」均为假象。 **What needs to change:**
实现真实同步/生成，或明确标注 TODO 并移除成功提示。

## [V2] validateConfiguration 只查一个字段

**File:** apps/yuleasr-vscode/src/commands/index.ts:221-260 **Severity:**
warning **What is wrong:** 所谓校验仅检查 `data.moduleName`
是否存在，其余一切静默通过；`performValidation`（ConfigEditorPanel.ts:263-280）也只检查「是对象」。
**Why it matters:** 错误配置会被当作「valid」。 **What needs to change:**
接入 @yuletech/core 的 validateAll / ConfigValidator。

---

# 七、global / 跨包问题

## [G1] ConfigGetAllSchemas 与 loadModuleSchemas 双源并存、后者覆盖前者

**File:** apps/yuleasr-web/src/stores/configStore.ts:59-66 **Severity:**
suggestion **What is wrong:**
validateCrossModuleChanges 混入 defaultMcuSchema/defaultCanSchema/defaultGptSchema +
schemaExtractor.getAllSchemas() +
loadModuleSchemas()，同名模块后者覆盖前者，前两个 source 实际无意义；且每次 updateParameter 都重新加载全部 schema（每次构建 Map），性能差。
**What needs to change:** 单源 schema 缓存 + 按需取用。

## [G2] 测试覆盖严重不足（与任务关注点相关）

**File:** packages/@yuletech/core/src/validator/index.ts 等（全仓抽样）
**Severity:** warning **What is wrong:**
全仓仅有少量 schema 测试（`src/schema/__tests__/`），evaluator/propagator/generators/validators/configStore 均无单元测试；C1/C3/K1 这类致命问题若有测试必然在 CI 暴露。
**Why it matters:** 无回归保护，修复后易复发。 **What needs to change:**
为 conditions、validators、ecuc/os
generator、configStore 的 updateParameter/参数路径解析、api-client 前缀契约补最小测试集。

---

# 八、区域结论

- **@yuletech/utils、@yuletech/ui**：未发现明显逻辑问题（按未深入处理，工具函数/基础组件规模小，风险低）。
- **数据文件（all-modules.ts、modules.ts、spec/\*）**：快速扫过，未发现逻辑类错误（id 命名模式一致性 OK）；数据量大，建议后续做 schema 一致性检查（参数 id 唯一性、容器引用完整性）。
- **yulecommunity 社区端**：以展示型组件为主，抽查未发现危害性逻辑错误；`adminStore`/权限逻辑未深入。
- **electron 桌面壳**：未审查（不在本轮精读范围）。

---

# 九、修复优先级建议

| 优先级 | 问题                                                        | 影响                |
| ------ | ----------------------------------------------------------- | ------------------- |
| P0     | C1 参数编辑静默失败                                         | 核心编辑功能不可用  |
| P0     | C2 实例数据不持久化                                         | 数据丢失            |
| P0     | C3/A1 API 前缀+路由+ID 错配                                 | 认证/云同步整体失效 |
| P1     | K1 schema 插件空转；E5 validate 空实现；V1/V2 vscode 假功能 | 验证/同步名不副实   |
| P1     | W1 模块选择错乱；K6/K7 生成的 C 不可编译                    | 编辑错误→错误代码   |
| P2     | E1/E2/E3 undo/redo 语义；K2-K5、W2-W11 等                   | 边界/健壮性         |
| P2     | G2 补测试                                                   | 回归防护            |

---

**交付说明：**
审查覆盖约 90 个核心文件；建议后续补审 electron 主进程、community 管理端、未覆盖 UI 组件以形成完全覆盖。
