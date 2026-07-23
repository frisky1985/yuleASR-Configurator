# Code Generator Alignment - 任务拆解 & 排期

> **发起:** 2026-07-23 10:02 老板指令
> **触发:** 12:00 自动开始
> **目标:** 统一 4 个代码生成器的模板结构、AUTOSAR 4.4 合规深度、错误处理、MemMap 集成、文件命名规范

---

## 现状诊断

| 生成器 | 行数 | 文件数 | MemMap.h | DET | 插件化 | AUTOSAR Doxygen | 多编译器 |
|--------|------|--------|----------|-----|--------|----------------|---------|
| ecuc-generator | 955 | 1 | ✅ | ✅ | ✅ | ✅ 完整 | ✅ 4种 |
| swc-generator | 746 | 1 | ❌ | ❌ | ❌ | ⚠️ 部分 | ❌ |
| os-generator | 1,477 | 1 | ❌ | ❌ | ❌ | ⚠️ 不统一 | ❌ |
| rte-generator | 1,045 | 1 | ❌ | ❌ | ❌ | ⚠️ 部分 | ❌ |

**核心对齐点：**
1. **文件命名规范** — 统一为 `<Module>_Cfg.h` (B SW 标准) vs 现有混杂 `Ecuc_<M>.h`, `Os_Types.h` 等
2. **模板层** — 提取统一 generate-file-template(), 所有生成器共用文件头/尾部
3. **MemMap.h 集成** — ecuc 已有 wrapMemMapSection，其他 3 个补齐
4. **DET 错误处理** — ecuc 有 generateDetReportError, 其他补齐
5. **插件化接口** — ecuc 有 plugin delegation, 其他补齐
6. **Doxygen 注释风格** — 统一到 autosar-format.ts 的 generateAutosarFileHeader/FunctionHeader
7. **多编译器支持** — ecuc 有完整 CompilerAbstraction, 其他补齐

---

## 任务分解

### 阶段 1 — 模板层提取 (4h)

> **核心:** 把 4 个生成器共享的模板代码提取到 autosar-format.ts

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 1.1 | 提取通用文件头/尾生成函数，含版本、版权、AUTOSAR 标识 | 1h | autosar-format.ts 新增 `generateFileTemplate()` |
| 1.2 | 统一 include guard 风格，支持 AUTOSAR 标准宏前缀 | 0.5h | `toStandardGuard()` 函数 |
| 1.3 | 统一函数声明模板（MemMap + Doxygen 前缀） | 1h | `generateFunctionPrologue()` |
| 1.4 | 提取统一容器实例数组生成模板 | 1h | `generateContainerArrayBlock()` |
| 1.5 | 写测试验证模板函数 | 0.5h | 新增测试用例 |

### 阶段 2 — MemMap.h 补齐 (2h)

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 2.1 | swc-generator: const 数据段加 MemMap 包裹 | 0.5h | SWC .h 文件改 |
| 2.2 | os-generator: const 配置表加 MemMap 包裹 | 0.5h | Os.c 配置表改 |
| 2.3 | rte-generator: const 配置数据加 MemMap 包裹 | 0.5h | Rte_Lcfg.c 改 |
| 2.4 | 验证 4 个编译器下 MemMap 段名一致性 | 0.5h | 测试覆盖 |

### 阶段 3 — DET 错误处理补齐 (1.5h)

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 3.1 | swc-generator: 添加 `DEV_ERROR_DETECT` 守卫 | 0.5h | SWC 源文件改 |
| 3.2 | rte-generator: RTE API 加 Det_ReportError | 0.5h | Rte.c 函数改 |
| 3.3 | 写 DET 守卫测试 | 0.5h | 测试覆盖 |

### 阶段 4 — 插件化接口对齐 (1.5h)

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 4.1 | swc-generator: 支持 plugin delegation | 0.5h | 接口改 |
| 4.2 | rte-generator: 支持 plugin delegation | 0.5h | 接口改 |
| 4.3 | os-generator: 支持 plugin delegation | 0.5h | 接口改 |

### 阶段 5 — 多编译器支持补齐 (2h)

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 5.1 | swc-generator: 注入 CompilerAbstraction | 0.5h | SWC 代码改 |
| 5.2 | os-generator: 注入 CompilerAbstraction | 1h | OS 代码改（较大） |
| 5.3 | rte-generator: 注入 CompilerAbstraction | 0.5h | RTE 代码改 |

### 阶段 6 — 全量回归 & 测试增强 (2h)

| # | 任务 | 估算 | 产出 |
|---|------|------|------|
| 6.1 | 全量测试跑通 | 0.5h | vitest 全通过 |
| 6.2 | 4 个生成器输出对比验证（相同配置下输出结构一致） | 1h | 对比报告 |
| 6.3 | 更新 TASK_STATUS.md & sprint 文档 | 0.5h | 文档更新 |

---

## 总排期

| 阶段 | 估算 | 并行度 |
|------|------|--------|
| 阶段 1 — 模板层提取 | 4h | 串行（基础层必须先做） |
| 阶段 2 — MemMap 补齐 | 2h | 可与阶段 3 并行 |
| 阶段 3 — DET 补齐 | 1.5h | 可与阶段 2 并行 |
| 阶段 4 — 插件化对齐 | 1.5h | 依赖阶段 1 |
| 阶段 5 — 多编译器补齐 | 2h | 依赖阶段 1 |
| 阶段 6 — 全量回归 | 2h | 最后做 |
| **总计** | **~13h** | 实际约 **6-8h**（并行） |

---

## 验证标准

- [ ] 4 个生成器全部使用统一的 autosar-format.ts 模板函数
- [ ] 所有 const 数据段包裹 MemMap.h
- [ ] 所有关键 API 带 DEV_ERROR_DETECT 守卫
- [ ] 4 个生成器均支持 plugin delegation
- [ ] 4 个生成器均支持 4 种编译器 (GCC/IAR/Tasking/GHS)
- [ ] Doxygen 注释风格完全统一
- [ ] 全部 ~30+ 测试通过
- [ ] 输出对比：相同模块配置下 4 个生成器的代码风格一致
